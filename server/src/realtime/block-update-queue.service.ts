import { Injectable, Inject, forwardRef, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BlocksService } from "../pages/blocks/blocks.service";
import { PagesService } from "../pages/pages.service";
import { Block } from "../pages/blocks/entities/block.entity";

interface QueuedUpdate {
  blockId: string;
  blockData: Partial<Block>;
  userId: string;
  pageId: string;
  timestamp: number;
}

@Injectable()
export class BlockUpdateQueueService {
  private readonly logger = new Logger(BlockUpdateQueueService.name);
  private pendingUpdates: Map<string, QueuedUpdate> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay: number;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => BlocksService))
    private blocksService: BlocksService,
    @Inject(forwardRef(() => PagesService))
    private pagesService: PagesService
  ) {
    this.debounceDelay = parseInt(
      this.configService.get<string>("BLOCK_UPDATE_DEBOUNCE_MS") || "500",
      10
    );
  }

  /**
   * Queue a block update for debounced saving
   */
  queueUpdate(
    blockId: string,
    blockData: Partial<Block>,
    userId: string,
    pageId: string
  ): void {
    // Store or update the pending update (last update wins for same block)
    this.pendingUpdates.set(blockId, {
      blockId,
      blockData,
      userId,
      pageId,
      timestamp: Date.now(),
    });

    // Clear existing timer for this page (to debounce all updates on the same page together)
    const existingTimer = this.debounceTimers.get(pageId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer for this page
    const timer = setTimeout(() => {
      this.flushPage(pageId);
    }, this.debounceDelay);

    this.debounceTimers.set(pageId, timer);
    this.logger.debug(`Queued update for block ${blockId} on page ${pageId}`);
  }

  /**
   * Flush all pending updates for a specific page
   */
  async flushPage(pageId: string): Promise<void> {
    const timer = this.debounceTimers.get(pageId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(pageId);
    }

    // Get all updates for this page
    const pageUpdates = Array.from(this.pendingUpdates.values()).filter(
      (update) => update.pageId === pageId
    );

    if (pageUpdates.length === 0) {
      return;
    }

    this.logger.log(
      `Flushing ${pageUpdates.length} pending updates for page ${pageId}`
    );

    try {
      // Resolve conflicts and prepare updates
      const updatesToSave = await this.resolveConflicts(pageUpdates);

      if (updatesToSave.length === 0) {
        this.logger.warn(
          `All updates for page ${pageId} were skipped due to conflicts`
        );
        // Clear pending updates even if skipped
        pageUpdates.forEach((update) =>
          this.pendingUpdates.delete(update.blockId)
        );
        return;
      }

      // Batch save all updates
      await this.blocksService.updateBatch(
        updatesToSave.map((update) => ({
          id: update.blockId,
          data: update.blockData,
        }))
      );

      // Update page timestamp
      await this.pagesService.update(pageId, {});

      // Remove saved updates from pending queue
      updatesToSave.forEach((update) =>
        this.pendingUpdates.delete(update.blockId)
      );

      this.logger.log(
        `Successfully saved ${updatesToSave.length} block updates for page ${pageId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to flush updates for page ${pageId}:`,
        error.stack || error.message
      );
      throw error;
    }
  }

  /**
   * Flush all pending updates (used on disconnect)
   */
  async flush(): Promise<void> {
    const pageIds = new Set(
      Array.from(this.pendingUpdates.values()).map((update) => update.pageId)
    );

    // Clear all timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Flush each page
    await Promise.all(Array.from(pageIds).map((pageId) => this.flushPage(pageId)));
  }

  /**
   * Flush updates for a specific user (used on disconnect)
   */
  async flushUser(userId: string): Promise<void> {
    const userUpdates = Array.from(this.pendingUpdates.values()).filter(
      (update) => update.userId === userId
    );

    if (userUpdates.length === 0) {
      return;
    }

    const pageIds = new Set(userUpdates.map((update) => update.pageId));
    await Promise.all(Array.from(pageIds).map((pageId) => this.flushPage(pageId)));
  }

  /**
   * Clear all pending updates (used for cleanup)
   */
  clear(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
    this.pendingUpdates.clear();
    this.logger.debug("Cleared all pending block updates");
  }

  /**
   * Resolve conflicts using last-write-wins strategy
   * Compare timestamps to determine which updates should be saved
   */
  private async resolveConflicts(
    updates: QueuedUpdate[]
  ): Promise<QueuedUpdate[]> {
    const updatesToSave: QueuedUpdate[] = [];

    for (const update of updates) {
      try {
        // Get current block from database
        const currentBlock = await this.blocksService.findOne(update.blockId);

        if (!currentBlock) {
          // Block doesn't exist, skip this update
          this.logger.warn(
            `Block ${update.blockId} not found, skipping update`
          );
          continue;
        }

        // Compare timestamps: if queued update is newer or equal, save it
        // Convert dates to timestamps for comparison
        const dbTimestamp = currentBlock.updatedAt.getTime();
        const queuedTimestamp = update.timestamp;

        if (queuedTimestamp >= dbTimestamp) {
          // Queued update is newer or same, proceed with save
          updatesToSave.push(update);
        } else {
          // Database block is newer, skip this update (conflict detected)
          this.logger.warn(
            `Conflict detected for block ${update.blockId}: database is newer (${dbTimestamp} > ${queuedTimestamp})`
          );
        }
      } catch (error) {
        this.logger.error(
          `Error resolving conflict for block ${update.blockId}:`,
          error.stack || error.message
        );
        // Continue with other updates
      }
    }

    return updatesToSave;
  }
}

