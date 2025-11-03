import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmbeddingService } from "../embedding/embedding.service";
import { Block } from "../../pages/blocks/entities/block.entity";
import { Embedding } from "../embedding/entities/embedding.entity";

@Injectable()
export class RAGService {
  constructor(
    private embeddingService: EmbeddingService,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  ) {}

  async search(query: string, workspaceId: string): Promise<string> {
    // Generate embedding for query
    const similarEmbeddings = await this.embeddingService.searchSimilar(
      query,
      10
    );

    // Get blocks from embeddings and filter by workspace
    const blockIds = similarEmbeddings.map((e) => e.blockId);
    if (blockIds.length === 0) {
      return "";
    }

    const blocks = await this.blockRepository
      .createQueryBuilder("block")
      .innerJoin("block.page", "page")
      .where("block.id IN (:...ids)", { ids: blockIds })
      .andWhere("page.workspaceId = :workspaceId", { workspaceId })
      .getMany();

    // Extract text from blocks
    const contextTexts = blocks.map((block) => {
      if (block.type === "text" || block.type === "heading") {
        return block.content?.text || "";
      }
      if (block.type === "code") {
        return block.content?.code || "";
      }
      return "";
    });

    return contextTexts.filter((text) => text.length > 0).join("\n\n");
  }
}

