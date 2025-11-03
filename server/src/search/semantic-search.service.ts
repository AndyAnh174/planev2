import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Embedding } from "../ai/embedding/entities/embedding.entity";
import { Block } from "../pages/blocks/entities/block.entity";
import { EmbeddingService } from "../ai/embedding/embedding.service";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SemanticSearchService {
  private embeddingApiUrl: string;
  private maxLength: number;

  constructor(
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @Inject(forwardRef(() => EmbeddingService))
    private embeddingService: EmbeddingService,
    private configService: ConfigService
  ) {
    const aiConfig = this.configService.get("ai");
    this.embeddingApiUrl = aiConfig.embedding.apiUrl;
    this.maxLength = aiConfig.embedding.maxLength;
  }

  private async generateEmbeddingForText(text: string): Promise<string> {
    try {
      const response = await axios.post(this.embeddingApiUrl, {
        texts: [text],
        max_length: this.maxLength,
      });
      const embedding = response.data.embeddings[0];
      return `[${embedding.join(",")}]`;
    } catch (error) {
      console.error("Embedding generation error:", error);
      throw error;
    }
  }

  async semanticSearch(
    query: string,
    workspaceId: string,
    limit: number = 10
  ): Promise<Block[]> {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbeddingForText(query);

    // Find similar embeddings using pgvector
    const similarEmbeddings = await this.embeddingRepository
      .createQueryBuilder("embedding")
      .innerJoin("embedding.block", "block")
      .innerJoin("block.page", "page")
      .where("page.workspaceId = :workspaceId", { workspaceId })
      .orderBy(
        `embedding.vector <=> '${queryEmbedding}'::vector`,
        "ASC"
      )
      .limit(limit)
      .getMany();

    // Get blocks from embeddings
    const blockIds = similarEmbeddings.map((e) => e.blockId);
    if (blockIds.length === 0) {
      return [];
    }

    return this.blockRepository
      .createQueryBuilder("block")
      .where("block.id IN (:...ids)", { ids: blockIds })
      .getMany();
  }

  async hybridSearch(
    query: string,
    workspaceId: string,
    limit: number = 20
  ): Promise<{ pages: any[]; blocks: Block[] }> {
    // Combine full-text search with semantic search
    const semanticResults = await this.semanticSearch(query, workspaceId, limit);

    // You can combine with full-text search results here if needed
    return {
      pages: [],
      blocks: semanticResults,
    };
  }
}

