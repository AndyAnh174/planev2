import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { SemanticSearchService } from "./semantic-search.service";
import { Page } from "../pages/entities/page.entity";
import { Block } from "../pages/blocks/entities/block.entity";
import { Embedding } from "../ai/embedding/entities/embedding.entity";
import { AIModule } from "../ai/ai.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, Block, Embedding]),
    ConfigModule,
    forwardRef(() => AIModule),
  ],
  controllers: [SearchController],
  providers: [SearchService, SemanticSearchService],
  exports: [SearchService, SemanticSearchService],
})
export class SearchModule {}

