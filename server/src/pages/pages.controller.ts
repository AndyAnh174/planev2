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
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from "@nestjs/swagger";
import { PagesService } from "./pages.service";
import { PageHistoryService } from "./page-history/page-history.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { PublishPageDto } from "./dto/publish-page.dto";
import { UpdateSeoDto } from "./dto/update-seo.dto";

@ApiTags("pages")
@ApiBearerAuth("JWT-auth")
@Controller("pages")
@UseGuards(AuthGuard("jwt"))
export class PagesController {
  constructor(
    private pagesService: PagesService,
    private pageHistoryService: PageHistoryService
  ) {}

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
  update(
    @Param("id") id: string,
    @Body() updateDto: UpdatePageDto,
    @CurrentUser() user: any
  ) {
    const authorId = user.userId || user.sub;
    return this.pagesService.update(id, updateDto, authorId);
  }

  @Post(":id/publish")
  @ApiOperation({ summary: "Publish page thành công khai" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Page đã được publish" })
  publish(@Param("id") id: string, @Body() body: PublishPageDto & { isIndexed?: boolean }) {
    return this.pagesService.publish(id, body.slug, body.isIndexed || false);
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

  @Get(":id/history")
  @ApiOperation({ summary: "Lấy danh sách lịch sử versions của page" })
  @ApiParam({ name: "id", type: String, description: "ID của page" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Số lượng versions tối đa (default: 30)" })
  @ApiResponse({ status: 200, description: "Danh sách versions" })
  @ApiResponse({ status: 404, description: "Page không tìm thấy" })
  async getHistory(
    @Param("id") id: string,
    @Query("limit") limit?: string,
    @CurrentUser() user?: any
  ) {
    // Verify page exists
    const page = await this.pagesService.findOne(id);
    if (!page) {
      throw new NotFoundException("Page không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    const userId = user?.userId || user?.sub;
    if (userId) {
      const hasPermission = await this.pagesService.checkUserPermission(id, userId);
      if (!hasPermission) {
        throw new ForbiddenException("Bạn không có quyền xem lịch sử của page này");
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 30;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException("Limit phải là số từ 1 đến 100");
    }

    return this.pageHistoryService.findAll(id, limitNum);
  }

  @Get(":id/history/:versionId")
  @ApiOperation({ summary: "Lấy chi tiết một version cụ thể của page" })
  @ApiParam({ name: "id", type: String, description: "ID của page" })
  @ApiParam({ name: "versionId", type: String, description: "ID của version" })
  @ApiResponse({ status: 200, description: "Chi tiết version" })
  @ApiResponse({ status: 404, description: "Page hoặc version không tìm thấy" })
  async getVersion(
    @Param("id") pageId: string,
    @Param("versionId") versionId: string,
    @CurrentUser() user?: any
  ) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pageId) || !uuidRegex.test(versionId)) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Verify page exists
    const page = await this.pagesService.findOne(pageId);
    if (!page) {
      throw new NotFoundException("Page không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    const userId = user?.userId || user?.sub;
    if (userId) {
      const hasPermission = await this.pagesService.checkUserPermission(pageId, userId);
      if (!hasPermission) {
        throw new ForbiddenException("Bạn không có quyền xem version này");
      }
    }

    // Get version and validate it belongs to pageId
    const version = await this.pageHistoryService.findByVersionIdAndPageId(versionId, pageId);
    if (!version) {
      throw new NotFoundException("Version không tìm thấy hoặc không thuộc về page này");
    }

    return version;
  }

  @Post(":id/history/:versionId/restore")
  @ApiOperation({ summary: "Restore page về một version cũ" })
  @ApiParam({ name: "id", type: String, description: "ID của page" })
  @ApiParam({ name: "versionId", type: String, description: "ID của version muốn restore" })
  @ApiResponse({ status: 200, description: "Page đã được restore thành công" })
  @ApiResponse({ status: 404, description: "Page hoặc version không tìm thấy" })
  @ApiResponse({ status: 403, description: "Không có quyền edit page" })
  async restoreVersion(
    @Param("id") pageId: string,
    @Param("versionId") versionId: string,
    @CurrentUser() user: any
  ) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pageId) || !uuidRegex.test(versionId)) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Verify page exists
    const page = await this.pagesService.findOne(pageId);
    if (!page) {
      throw new NotFoundException("Page không tìm thấy");
    }

    // Check permission - user phải là member của workspace và có quyền edit (member, admin, owner)
    const userId = user.userId || user.sub;
    const hasPermission = await this.pagesService.checkUserPermission(pageId, userId, "member");
    if (!hasPermission) {
      throw new ForbiddenException("Bạn không có quyền restore page này. Cần quyền member trở lên.");
    }

    try {
      const restoredPage = await this.pageHistoryService.restore(pageId, versionId, userId);
      return restoredPage;
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get(":id/history/compare")
  @ApiOperation({ summary: "So sánh 2 versions của page" })
  @ApiParam({ name: "id", type: String, description: "ID của page" })
  @ApiQuery({ name: "version1", required: true, type: String, description: "ID của version 1" })
  @ApiQuery({ name: "version2", required: true, type: String, description: "ID của version 2" })
  @ApiResponse({ status: 200, description: "Kết quả so sánh" })
  @ApiResponse({ status: 404, description: "Page hoặc version không tìm thấy" })
  @ApiResponse({ status: 400, description: "version1 và version2 không hợp lệ" })
  async compareVersions(
    @Param("id") pageId: string,
    @Query("version1") version1Id: string,
    @Query("version2") version2Id: string
  ) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pageId) || !uuidRegex.test(version1Id) || !uuidRegex.test(version2Id)) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Validate version1 và version2 phải khác nhau
    if (version1Id === version2Id) {
      throw new BadRequestException("version1 và version2 phải khác nhau");
    }

    // Verify page exists
    const page = await this.pagesService.findOne(pageId);
    if (!page) {
      throw new NotFoundException("Page không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    // Note: user is from JWT guard, so it should be available
    // For compare, viewer can see, so we don't need to check specific role

    try {
      return await this.pageHistoryService.compare(pageId, version1Id, version2Id);
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Patch(":id/seo")
  @ApiOperation({ summary: "Update SEO settings cho page" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "SEO settings đã được cập nhật" })
  updateSeo(@Param("id") id: string, @Body() body: UpdateSeoDto) {
    return this.pagesService.updateSeo(id, body.isIndexed || false);
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

