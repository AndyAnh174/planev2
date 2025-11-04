import { Injectable, Inject, forwardRef, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlockHistory } from "../entities/block-history.entity";
import { BlocksService } from "../blocks.service";
import { Block } from "../entities/block.entity";

@Injectable()
export class BlockHistoryService {
  constructor(
    @InjectRepository(BlockHistory)
    private historyRepository: Repository<BlockHistory>,
    @Inject(forwardRef(() => BlocksService))
    private blocksService: BlocksService
  ) {}

  async create(blockId: string, contentSnapshot: any, authorId: string) {
    const latestVersion = await this.getLatestVersion(blockId);
    const history = this.historyRepository.create({
      blockId,
      contentSnapshot,
      version: latestVersion + 1,
      authorId,
    });
    return this.historyRepository.save(history);
  }

  async findAll(blockId: string, limit: number = 30) {
    return this.historyRepository.find({
      where: { blockId },
      relations: ["author"],
      order: { version: "DESC" },
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.historyRepository.findOne({
      where: { id },
      relations: ["author", "block"],
    });
  }

  async findByVersionIdAndBlockId(versionId: string, blockId: string) {
    return this.historyRepository.findOne({
      where: { id: versionId, blockId },
      relations: ["author", "block"],
    });
  }

  async getLatestVersion(blockId: string): Promise<number> {
    const latest = await this.historyRepository.findOne({
      where: { blockId },
      order: { version: "DESC" },
    });
    return latest?.version || 0;
  }

  async cleanupOldVersions(blockId: string) {
    // Keep only last 30 versions
    const allVersions = await this.historyRepository.find({
      where: { blockId },
      order: { version: "DESC" },
    });

    if (allVersions.length > 30) {
      const toDelete = allVersions.slice(30);
      await this.historyRepository.remove(toDelete);
    }
  }

  async restore(blockId: string, versionId: string, userId: string) {
    // 1. Get history version by versionId and blockId
    const historyVersion = await this.findByVersionIdAndBlockId(versionId, blockId);
    if (!historyVersion) {
      throw new NotFoundException(
        "Version không tìm thấy hoặc không thuộc về block này"
      );
    }

    // 2. Get current block
    const currentBlock = await this.blocksService.findOne(blockId);
    if (!currentBlock) {
      throw new NotFoundException("Block không tìm thấy");
    }

    // 3. Create new history snapshot of current state (before restoring)
    const currentSnapshot = {
      type: currentBlock.type,
      content: currentBlock.content,
      orderIndex: currentBlock.orderIndex,
      parentId: currentBlock.parentId,
    };
    await this.create(blockId, currentSnapshot, userId);

    // 4. Restore block content from contentSnapshot
    const snapshot = historyVersion.contentSnapshot;
    await this.blocksService.update(blockId, {
      type: snapshot.type || currentBlock.type,
      content: snapshot.content || currentBlock.content,
      orderIndex: snapshot.orderIndex !== undefined ? snapshot.orderIndex : currentBlock.orderIndex,
      parentId: snapshot.parentId !== undefined ? snapshot.parentId : currentBlock.parentId,
    });

    // 5. Return restored block
    return this.blocksService.findOne(blockId);
  }

  async compare(blockId: string, version1Id: string, version2Id: string) {
    // Get both versions
    const version1 = await this.findByVersionIdAndBlockId(version1Id, blockId);
    const version2 = await this.findByVersionIdAndBlockId(version2Id, blockId);

    if (!version1) {
      throw new NotFoundException(
        "Version 1 không tìm thấy hoặc không thuộc về block này"
      );
    }
    if (!version2) {
      throw new NotFoundException(
        "Version 2 không tìm thấy hoặc không thuộc về block này"
      );
    }

    return {
      version1: {
        id: version1.id,
        version: version1.version,
        createdAt: version1.createdAt,
        author: version1.author,
        contentSnapshot: version1.contentSnapshot,
      },
      version2: {
        id: version2.id,
        version: version2.version,
        createdAt: version2.createdAt,
        author: version2.author,
        contentSnapshot: version2.contentSnapshot,
      },
      // Basic diff info
      diff: {
        typeChanged:
          version1.contentSnapshot.type !== version2.contentSnapshot.type,
        contentChanged:
          JSON.stringify(version1.contentSnapshot.content) !==
          JSON.stringify(version2.contentSnapshot.content),
        orderIndexChanged:
          version1.contentSnapshot.orderIndex !==
          version2.contentSnapshot.orderIndex,
        parentIdChanged:
          version1.contentSnapshot.parentId !==
          version2.contentSnapshot.parentId,
      },
    };
  }
}

