import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageHistory } from "../entities/page-history.entity";

@Injectable()
export class PageHistoryService {
  constructor(
    @InjectRepository(PageHistory)
    private historyRepository: Repository<PageHistory>
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

  async findAll(pageId: string) {
    return this.historyRepository.find({
      where: { pageId },
      order: { version: "DESC" },
      take: 30, // Max 30 versions
    });
  }

  async findOne(id: string) {
    return this.historyRepository.findOne({ where: { id } });
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
}

