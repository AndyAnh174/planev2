import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { BoardsService } from "./boards.service";
import { CreateBoardDto } from "./dto/create-board.dto";

@ApiTags("boards")
@ApiBearerAuth("JWT-auth")
@Controller("boards")
@UseGuards(AuthGuard("jwt"))
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: "Tạo board mới" })
  @ApiQuery({ name: "workspaceId", required: true, type: String })
  @ApiResponse({ status: 201, description: "Board đã được tạo" })
  create(@Body() createDto: CreateBoardDto, @Query("workspaceId") workspaceId: string) {
    return this.boardsService.create(createDto, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách boards trong workspace" })
  @ApiQuery({ name: "workspaceId", required: true, type: String })
  @ApiResponse({ status: 200, description: "Danh sách boards" })
  findAll(@Query("workspaceId") workspaceId: string) {
    return this.boardsService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin board theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin board" })
  findOne(@Param("id") id: string) {
    return this.boardsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật board" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Board đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: any) {
    return this.boardsService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa board" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Board đã được xóa" })
  remove(@Param("id") id: string) {
    return this.boardsService.remove(id);
  }
}

