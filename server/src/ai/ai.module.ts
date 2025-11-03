import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AIController } from "./ai.controller";
import { AIService } from "./ai.service";
import { OllamaService } from "./ollama/ollama.service";
import { GeminiService } from "./gemini/gemini.service";
import { EmbeddingService } from "./embedding/embedding.service";
import { RAGService } from "./rag/rag.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Embedding } from "./embedding/entities/embedding.entity";
import { Block } from "../pages/blocks/entities/block.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Embedding, Block]),
    ConfigModule,
  ],
  controllers: [AIController],
  providers: [
    AIService,
    OllamaService,
    GeminiService,
    EmbeddingService,
    RAGService,
  ],
  exports: [AIService, EmbeddingService],
})
export class AIModule {}

