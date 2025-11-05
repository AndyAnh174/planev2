import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { WorkspaceMembersController } from "./workspace-members/workspace-members.controller";
import { WorkspaceMembersService } from "./workspace-members/workspace-members.service";
import { WorkspaceExportService } from "./workspace-export.service";
import { PDFGenerationService } from "../common/services/pdf-generation.service";
import { EmailService } from "../common/services/email.service";
import { InvitationsController, PublicInvitationsController } from "./invitations/invitations.controller";
import { InvitationsService } from "./invitations/invitations.service";
import { PagesModule } from "../pages/pages.module";
import { BoardsModule } from "../boards/boards.module";
import { FilesModule } from "../files/files.module";
import { UsersModule } from "../users/users.module";
import { Workspace } from "./entities/workspace.entity";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { WorkspaceInvitation } from "./invitations/entities/invitation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, WorkspaceInvitation]),
    forwardRef(() => PagesModule),
    forwardRef(() => BoardsModule),
    forwardRef(() => FilesModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [
    WorkspacesController,
    WorkspaceMembersController,
    InvitationsController,
    PublicInvitationsController,
  ],
  providers: [
    WorkspacesService,
    WorkspaceMembersService,
    WorkspaceExportService,
    PDFGenerationService,
    EmailService,
    InvitationsService,
  ],
  exports: [
    WorkspacesService,
    WorkspaceMembersService,
    WorkspaceExportService,
    InvitationsService,
  ],
})
export class WorkspacesModule {}

