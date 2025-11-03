import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Page } from "../pages/entities/page.entity";
import { Block } from "../pages/blocks/entities/block.entity";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  ) {}

  async searchPages(
    query: string,
    workspaceId: string,
    limit: number = 20
  ): Promise<Page[]> {
    return this.pageRepository
      .createQueryBuilder("page")
      .where("page.workspaceId = :workspaceId", { workspaceId })
      .andWhere(
        "(page.title ILIKE :query OR page.slug ILIKE :query)",
        { query: `%${query}%` }
      )
      .limit(limit)
      .getMany();
  }

  async searchBlocks(
    query: string,
    workspaceId: string,
    limit: number = 20
  ): Promise<Block[]> {
    return this.blockRepository
      .createQueryBuilder("block")
      .innerJoin("block.page", "page")
      .where("page.workspaceId = :workspaceId", { workspaceId })
      .andWhere(
        "(block.content::text ILIKE :query)",
        { query: `%${query}%` }
      )
      .limit(limit)
      .getMany();
  }

  async fullTextSearch(
    query: string,
    workspaceId: string
  ): Promise<{ pages: Page[]; blocks: Block[] }> {
    const pages = await this.searchPages(query, workspaceId);
    const blocks = await this.searchBlocks(query, workspaceId);

    return { pages, blocks };
  }
}

