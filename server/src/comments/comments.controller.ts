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
import { CommentsService } from "./comments.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateCommentDto } from "./dto/create-comment.dto";

@ApiTags("comments")
@ApiBearerAuth("JWT-auth")
@Controller("comments")
@UseGuards(AuthGuard("jwt"))
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: "Tạo comment mới" })
  @ApiResponse({ status: 201, description: "Comment đã được tạo" })
  create(@Body() createDto: CreateCommentDto, @CurrentUser() user: any) {
    return this.commentsService.create(
      createDto,
      createDto.targetType,
      createDto.targetId,
      user.userId || user.sub
    );
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách comments" })
  @ApiQuery({ name: "targetType", required: true, enum: ["page", "block", "card"] })
  @ApiQuery({ name: "targetId", required: true, type: String })
  @ApiResponse({ status: 200, description: "Danh sách comments" })
  findAll(
    @Query("targetType") targetType: string,
    @Query("targetId") targetId: string
  ) {
    return this.commentsService.findAll(targetType as any, targetId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin comment theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin comment" })
  findOne(@Param("id") id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật comment" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Comment đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: any) {
    return this.commentsService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa comment" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Comment đã được xóa" })
  remove(@Param("id") id: string) {
    return this.commentsService.remove(id);
  }
}

