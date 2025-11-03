import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { Embedding } from "./entities/embedding.entity";
import { Block } from "../../pages/blocks/entities/block.entity";

@Injectable()
export class EmbeddingService {
  private apiUrl: string;
  private maxLength: number;

  constructor(
    @InjectRepository(Embedding)
    private embeddingRepository: Repository<Embedding>,
    private configService: ConfigService
  ) {
    const aiConfig = this.configService.get("ai");
    this.apiUrl = aiConfig.embedding.apiUrl;
    this.maxLength = aiConfig.embedding.maxLength;
  }

  private extractTextFromBlock(block: Block): string {
    if (block.type === "text" || block.type === "heading") {
      return block.content?.text || "";
    }
    if (block.type === "code") {
      return block.content?.code || "";
    }
    return "";
  }

  async generateEmbedding(block: Block): Promise<void> {
    const text = this.extractTextFromBlock(block);
    if (!text || text.length < 10) return;

    try {
      const response = await axios.post(this.apiUrl, {
        texts: [text],
        max_length: this.maxLength,
      });

      const embeddingVector = response.data.embeddings[0];

      const embedding = this.embeddingRepository.create({
        blockId: block.id,
        pageId: block.pageId,
        vector: `[${embeddingVector.join(",")}]`,
        metadata: {
          model: "BAAI/bge-m3",
          dimension: embeddingVector.length,
        },
      });

      await this.embeddingRepository.save(embedding);
    } catch (error) {
      console.error("Embedding generation error:", error);
    }
  }

  async searchSimilar(query: string, limit: number = 5) {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbeddingForText(query);

    // Semantic search using pgvector
    return this.embeddingRepository
      .createQueryBuilder("embedding")
      .select()
      .orderBy(`embedding.vector <=> '${queryEmbedding}'::vector`, "ASC")
      .limit(limit)
      .getMany();
  }

  private async generateEmbeddingForText(text: string): Promise<string> {
    try {
      const response = await axios.post(this.apiUrl, {
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
}

