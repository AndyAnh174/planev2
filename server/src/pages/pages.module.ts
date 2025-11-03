import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";
import { BlocksController } from "./blocks/blocks.controller";
import { BlocksService } from "./blocks/blocks.service";
import { PageHistoryService } from "./page-history/page-history.service";
import { Page } from "./entities/page.entity";
import { Block } from "./blocks/entities/block.entity";
import { PageHistory } from "./entities/page-history.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Page, Block, PageHistory])],
  controllers: [PagesController, BlocksController],
  providers: [PagesService, BlocksService, PageHistoryService],
  exports: [PagesService, BlocksService],
})
export class PagesModule {}

