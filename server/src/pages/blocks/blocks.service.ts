import { Injectable, Inject, forwardRef, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Block, BlockType } from "./entities/block.entity";
import { BlockHistoryService } from "./block-history/block-history.service";

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private dataSource: DataSource,
    @Optional()
    @Inject(forwardRef(() => BlockHistoryService))
    private blockHistoryService?: BlockHistoryService
  ) {}

  async create(createDto: Partial<Block>, pageId: string) {
    const block = this.blockRepository.create({
      ...createDto,
      pageId,
    });
    return this.blockRepository.save(block);
  }

  async findAll(pageId: string) {
    return this.blockRepository.find({
      where: { pageId },
      order: { orderIndex: "ASC" },
    });
  }

  async findOne(id: string) {
    return this.blockRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDto: Partial<Block>, authorId?: string) {
    // Get current block state before update
    const currentBlock = await this.findOne(id);
    if (!currentBlock) {
      throw new Error("Block not found");
    }

    // Update block
    await this.blockRepository.update(id, updateDto);
    const updatedBlock = await this.findOne(id);

    // Auto-create history snapshot if BlockHistoryService is available
    if (this.blockHistoryService && authorId) {
      try {
        const contentSnapshot = {
          type: currentBlock.type,
          content: currentBlock.content,
          orderIndex: currentBlock.orderIndex,
          parentId: currentBlock.parentId,
        };
        await this.blockHistoryService.create(id, contentSnapshot, authorId);
      } catch (error) {
        // Log error but don't fail the update
        console.error("Failed to create block history snapshot:", error);
      }
    }

    return updatedBlock;
  }

  /**
   * Batch update multiple blocks in a transaction
   * @param updates Array of {id, data} objects to update
   * @returns Array of updated Block entities
   */
  async updateBatch(
    updates: Array<{ id: string; data: Partial<Block> }>
  ): Promise<Block[]> {
    if (updates.length === 0) {
      return [];
    }

    // Use transaction to ensure atomic updates
    return await this.dataSource.transaction(async (manager) => {
      const blockRepository = manager.getRepository(Block);
      const updatedBlocks: Block[] = [];

      for (const update of updates) {
        await blockRepository.update(update.id, update.data);
        const updatedBlock = await blockRepository.findOne({
          where: { id: update.id },
        });
        if (updatedBlock) {
          updatedBlocks.push(updatedBlock);
        }
      }

      return updatedBlocks;
    });
  }

  async updateOrder(blockIds: string[]) {
    const updatePromises = blockIds.map((id, index) =>
      this.blockRepository.update(id, { orderIndex: index })
    );
    await Promise.all(updatePromises);
    return this.blockRepository
      .createQueryBuilder()
      .where("id IN (:...ids)", { ids: blockIds })
      .getMany();
  }

  async remove(id: string) {
    await this.blockRepository.delete(id);
  }
}

