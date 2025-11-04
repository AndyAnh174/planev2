import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { WorkspaceMembersController } from "./workspace-members/workspace-members.controller";
import { WorkspaceMembersService } from "./workspace-members/workspace-members.service";
import { WorkspaceExportService } from "./workspace-export.service";
import { PDFGenerationService } from "../common/services/pdf-generation.service";
import { PagesModule } from "../pages/pages.module";
import { BoardsModule } from "../boards/boards.module";
import { FilesModule } from "../files/files.module";
import { Workspace } from "./entities/workspace.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember]),
    forwardRef(() => PagesModule),
    forwardRef(() => BoardsModule),
    forwardRef(() => FilesModule),
  ],
  controllers: [WorkspacesController, WorkspaceMembersController],
  providers: [
    WorkspacesService,
    WorkspaceMembersService,
    WorkspaceExportService,
    PDFGenerationService,
  ],
  exports: [WorkspacesService, WorkspaceMembersService, WorkspaceExportService],
})
export class WorkspacesModule {}

