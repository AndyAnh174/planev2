import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { FilesService } from "./files.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("files")
@ApiBearerAuth("JWT-auth")
@Controller("files")
@UseGuards(AuthGuard("jwt"))
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload file" })
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "workspaceId", required: true, type: String })
  @ApiResponse({ status: 201, description: "File đã được upload" })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query("workspaceId") workspaceId: string,
    @CurrentUser() user: any
  ) {
    return this.filesService.uploadFile(file, workspaceId, user.userId);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách files trong workspace" })
  @ApiQuery({ name: "workspaceId", required: true, type: String })
  @ApiResponse({ status: 200, description: "Danh sách files" })
  findAll(@Query("workspaceId") workspaceId: string) {
    return this.filesService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin file theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin file" })
  findOne(@Param("id") id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa file" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "File đã được xóa" })
  remove(@Param("id") id: string) {
    return this.filesService.remove(id);
  }
}

