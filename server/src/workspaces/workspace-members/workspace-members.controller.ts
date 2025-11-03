import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WorkspaceMembersService } from "./workspace-members.service";
import { AddMemberDto } from "../dto/add-member.dto";
import { WorkspaceRole } from "../entities/workspace-member.entity";

@Controller("workspaces/:workspaceId/members")
@UseGuards(AuthGuard("jwt"))
export class WorkspaceMembersController {
  constructor(private workspaceMembersService: WorkspaceMembersService) {}

  @Get()
  findAll(@Param("workspaceId") workspaceId: string) {
    return this.workspaceMembersService.findAll(workspaceId);
  }

  @Post()
  addMember(
    @Param("workspaceId") workspaceId: string,
    @Body() addMemberDto: AddMemberDto
  ) {
    return this.workspaceMembersService.addMember(
      workspaceId,
      addMemberDto.userId,
      addMemberDto.role
    );
  }

  @Patch(":userId")
  updateRole(
    @Param("workspaceId") workspaceId: string,
    @Param("userId") userId: string,
    @Body() body: { role: WorkspaceRole }
  ) {
    return this.workspaceMembersService.updateRole(
      workspaceId,
      userId,
      body.role
    );
  }

  @Delete(":userId")
  removeMember(
    @Param("workspaceId") workspaceId: string,
    @Param("userId") userId: string
  ) {
    return this.workspaceMembersService.removeMember(workspaceId, userId);
  }
}

