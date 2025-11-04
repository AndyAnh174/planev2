import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagesController } from "./pages.controller";
import { PagesService } from "./pages.service";
import { BlocksController } from "./blocks/blocks.controller";
import { BlocksService } from "./blocks/blocks.service";
import { PageHistoryService } from "./page-history/page-history.service";
import { BlockHistoryService } from "./blocks/block-history/block-history.service";
import { BlockHistoryController } from "./blocks/block-history/block-history.controller";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { Page } from "./entities/page.entity";
import { Block } from "./blocks/entities/block.entity";
import { PageHistory } from "./entities/page-history.entity";
import { BlockHistory } from "./blocks/entities/block-history.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, Block, PageHistory, BlockHistory]),
    forwardRef(() => WorkspacesModule),
  ],
  controllers: [
    PagesController,
    BlocksController,
    BlockHistoryController,
  ],
  providers: [
    PagesService,
    BlocksService,
    PageHistoryService,
    BlockHistoryService,
  ],
  exports: [
    PagesService,
    BlocksService,
    PageHistoryService,
    BlockHistoryService,
  ],
})
export class PagesModule {}

