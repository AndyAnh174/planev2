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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { WorkspaceMembersService } from "./workspace-members.service";
import { AddMemberDto } from "../dto/add-member.dto";
import { WorkspaceRole } from "../entities/workspace-member.entity";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces/:workspaceId/members")
@UseGuards(AuthGuard("jwt"))
export class WorkspaceMembersController {
  constructor(private workspaceMembersService: WorkspaceMembersService) {}

  @Get()
  @ApiOperation({ summary: "Lấy danh sách members của workspace với pagination" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search by username or email" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page (default: 20)" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of results to skip (default: 0)" })
  @ApiResponse({ status: 200, description: "Danh sách members" })
  findAll(
    @Param("workspaceId") workspaceId: string,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.workspaceMembersService.findAll(workspaceId, search, limitNum, offsetNum);
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

