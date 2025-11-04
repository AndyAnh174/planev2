import { Injectable, Inject, forwardRef, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageHistory } from "../entities/page-history.entity";
import { PagesService } from "../pages.service";
import { BlocksService } from "../blocks/blocks.service";

@Injectable()
export class PageHistoryService {
  constructor(
    @InjectRepository(PageHistory)
    private historyRepository: Repository<PageHistory>,
    @Inject(forwardRef(() => PagesService))
    private pagesService: PagesService,
    private blocksService: BlocksService
  ) {}

  async create(pageId: string, contentSnapshot: any, authorId: string) {
    const latestVersion = await this.getLatestVersion(pageId);
    const history = this.historyRepository.create({
      pageId,
      contentSnapshot,
      version: latestVersion + 1,
      authorId,
    });
    return this.historyRepository.save(history);
  }

  async findAll(pageId: string, limit: number = 30) {
    return this.historyRepository.find({
      where: { pageId },
      relations: ["author"],
      order: { version: "DESC" },
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.historyRepository.findOne({ 
      where: { id },
      relations: ["author", "page"]
    });
  }

  async findByVersionIdAndPageId(versionId: string, pageId: string) {
    return this.historyRepository.findOne({ 
      where: { id: versionId, pageId },
      relations: ["author", "page"]
    });
  }

  async getLatestVersion(pageId: string): Promise<number> {
    const latest = await this.historyRepository.findOne({
      where: { pageId },
      order: { version: "DESC" },
    });
    return latest?.version || 0;
  }

  async cleanupOldVersions(pageId: string) {
    // Keep only last 30 versions
    const allVersions = await this.historyRepository.find({
      where: { pageId },
      order: { version: "DESC" },
    });

    if (allVersions.length > 30) {
      const toDelete = allVersions.slice(30);
      await this.historyRepository.remove(toDelete);
    }
  }

  async restore(pageId: string, versionId: string, userId: string) {
    // 1. Get history version by versionId và pageId
    const historyVersion = await this.findByVersionIdAndPageId(versionId, pageId);
    if (!historyVersion) {
      throw new NotFoundException("Version không tìm thấy hoặc không thuộc về page này");
    }

    // 2. Get current page với blocks
    const currentPage = await this.pagesService.findOne(pageId);
    if (!currentPage) {
      throw new NotFoundException("Page không tìm thấy");
    }

    // 3. Create new history snapshot của current state (trước khi restore)
    const currentSnapshot = {
      page: {
        title: currentPage.title,
        slug: currentPage.slug,
        visibility: currentPage.visibility,
        isIndexed: currentPage.isIndexed,
      },
      blocks: currentPage.blocks?.map((block) => ({
        id: block.id,
        type: block.type,
        content: block.content,
        orderIndex: block.orderIndex,
        parentId: block.parentId,
      })) || [],
    };
    await this.create(pageId, currentSnapshot, userId);

    // 4. Restore page content từ contentSnapshot
    const snapshot = historyVersion.contentSnapshot;
    if (snapshot.page) {
      await this.pagesService.update(pageId, {
        title: snapshot.page.title,
        slug: snapshot.page.slug,
        visibility: snapshot.page.visibility,
        isIndexed: snapshot.page.isIndexed,
      });
    }

    // 5. Restore blocks từ contentSnapshot
    if (snapshot.blocks && Array.isArray(snapshot.blocks)) {
      // Delete current blocks
      const currentBlocks = await this.blocksService.findAll(pageId);
      for (const block of currentBlocks) {
        await this.blocksService.remove(block.id);
      }

      // Create blocks từ snapshot
      for (const blockData of snapshot.blocks) {
        await this.blocksService.create(
          {
            type: blockData.type,
            content: blockData.content,
            orderIndex: blockData.orderIndex,
            parentId: blockData.parentId,
          },
          pageId
        );
      }
    }

    // 6. Return restored page
    return this.pagesService.findOne(pageId);
  }

  async compare(pageId: string, version1Id: string, version2Id: string) {
    // Get both versions
    const version1 = await this.findByVersionIdAndPageId(version1Id, pageId);
    const version2 = await this.findByVersionIdAndPageId(version2Id, pageId);

    if (!version1) {
      throw new NotFoundException("Version 1 không tìm thấy hoặc không thuộc về page này");
    }
    if (!version2) {
      throw new NotFoundException("Version 2 không tìm thấy hoặc không thuộc về page này");
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
      // Basic diff info - có thể enhance sau
      diff: {
        pageChanged: JSON.stringify(version1.contentSnapshot.page) !== JSON.stringify(version2.contentSnapshot.page),
        blocksChanged: JSON.stringify(version1.contentSnapshot.blocks) !== JSON.stringify(version2.contentSnapshot.blocks),
        blocksCount: {
          version1: version1.contentSnapshot.blocks?.length || 0,
          version2: version2.contentSnapshot.blocks?.length || 0,
        },
      },
    };
  }
}

