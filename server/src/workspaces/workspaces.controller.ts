import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { WorkspacesService } from "./workspaces.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces")
@UseGuards(AuthGuard("jwt"))
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: "Tạo workspace mới" })
  @ApiResponse({ status: 201, description: "Workspace đã được tạo" })
  create(@Body() createDto: CreateWorkspaceDto, @CurrentUser() user: any) {
    return this.workspacesService.create(
      createDto,
      user.userId || user.sub
    );
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách workspaces của user" })
  @ApiResponse({ status: 200, description: "Danh sách workspaces" })
  findAll(@CurrentUser() user: any) {
    return this.workspacesService.findAll(user.userId || user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin workspace theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin workspace" })
  findOne(@Param("id") id: string) {
    return this.workspacesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa workspace" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Workspace đã được xóa" })
  remove(@Param("id") id: string) {
    return this.workspacesService.remove(id);
  }
}

