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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { PagesService } from "./pages.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PublishPageDto } from "./dto/publish-page.dto";

@ApiTags("pages")
@ApiBearerAuth("JWT-auth")
@Controller("pages")
@UseGuards(AuthGuard("jwt"))
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: "Tạo page mới" })
  @ApiResponse({ status: 201, description: "Page được tạo thành công" })
  create(
    @Body() createDto: CreatePageDto,
    @CurrentUser() user: any
  ) {
    return this.pagesService.create(
      createDto,
      createDto.workspaceId,
      user.userId || user.sub
    );
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách pages trong workspace" })
  @ApiQuery({ name: "workspaceId", required: true, description: "ID của workspace" })
  findAll(@Query("workspaceId") workspaceId: string) {
    return this.pagesService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin page theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin page" })
  @ApiResponse({ status: 404, description: "Page không tồn tại" })
  findOne(@Param("id") id: string) {
    return this.pagesService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật page" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Page đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: UpdatePageDto) {
    return this.pagesService.update(id, updateDto);
  }

  @Post(":id/publish")
  @ApiOperation({ summary: "Publish page thành công khai" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Page đã được publish" })
  publish(@Param("id") id: string, @Body() body: PublishPageDto) {
    return this.pagesService.publish(id, body.slug);
  }

  @Delete(":id/publish")
  @ApiOperation({ summary: "Unpublish page" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Page đã được unpublish" })
  unpublish(@Param("id") id: string) {
    return this.pagesService.unpublish(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa page" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Page đã được xóa" })
  remove(@Param("id") id: string) {
    return this.pagesService.remove(id);
  }

  @Public()
  @Get("public/:slug")
  @ApiOperation({ summary: "Lấy public page bằng slug" })
  @ApiParam({ name: "slug", type: String })
  @ApiResponse({ status: 200, description: "Page công khai" })
  @ApiResponse({ status: 404, description: "Page không tìm thấy" })
  findBySlug(@Param("slug") slug: string) {
    return this.pagesService.findBySlug(slug);
  }
}

