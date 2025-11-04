import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { BlockHistoryService } from "./block-history.service";
import { BlocksService } from "../blocks.service";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";
import { PagesService } from "../../pages.service";

@ApiTags("blocks")
@ApiBearerAuth("JWT-auth")
@Controller("blocks")
@UseGuards(AuthGuard("jwt"))
export class BlockHistoryController {
  constructor(
    private blockHistoryService: BlockHistoryService,
    private blocksService: BlocksService,
    private pagesService: PagesService
  ) {}

  @Get(":blockId/history")
  @ApiOperation({ summary: "Lấy danh sách lịch sử versions của block" })
  @ApiParam({ name: "blockId", type: String, description: "ID của block" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Số lượng versions tối đa (default: 30)",
  })
  @ApiResponse({ status: 200, description: "Danh sách versions" })
  @ApiResponse({ status: 404, description: "Block không tìm thấy" })
  async getHistory(
    @Param("blockId") blockId: string,
    @Query("limit") limit?: string,
    @CurrentUser() user?: any
  ) {
    // Verify block exists and get page
    const block = await this.blocksService.findOne(blockId);
    if (!block) {
      throw new NotFoundException("Block không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    const userId = user?.userId || user?.sub;
    if (userId) {
      const hasPermission = await this.pagesService.checkUserPermission(
        block.pageId,
        userId
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          "Bạn không có quyền xem lịch sử của block này"
        );
      }
    }

    const limitNum = limit ? parseInt(limit, 10) : 30;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException("Limit phải là số từ 1 đến 100");
    }

    return this.blockHistoryService.findAll(blockId, limitNum);
  }

  @Get(":blockId/history/:versionId")
  @ApiOperation({ summary: "Lấy chi tiết một version cụ thể của block" })
  @ApiParam({ name: "blockId", type: String, description: "ID của block" })
  @ApiParam({ name: "versionId", type: String, description: "ID của version" })
  @ApiResponse({ status: 200, description: "Chi tiết version" })
  @ApiResponse({
    status: 404,
    description: "Block hoặc version không tìm thấy",
  })
  async getVersion(
    @Param("blockId") blockId: string,
    @Param("versionId") versionId: string,
    @CurrentUser() user?: any
  ) {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(blockId) || !uuidRegex.test(versionId)) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Verify block exists and get page
    const block = await this.blocksService.findOne(blockId);
    if (!block) {
      throw new NotFoundException("Block không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    const userId = user?.userId || user?.sub;
    if (userId) {
      const hasPermission = await this.pagesService.checkUserPermission(
        block.pageId,
        userId
      );
      if (!hasPermission) {
        throw new ForbiddenException("Bạn không có quyền xem version này");
      }
    }

    // Get version and validate it belongs to blockId
    const version =
      await this.blockHistoryService.findByVersionIdAndBlockId(
        versionId,
        blockId
      );
    if (!version) {
      throw new NotFoundException(
        "Version không tìm thấy hoặc không thuộc về block này"
      );
    }

    return version;
  }

  @Post(":blockId/history/:versionId/restore")
  @ApiOperation({ summary: "Restore block về một version cũ" })
  @ApiParam({ name: "blockId", type: String, description: "ID của block" })
  @ApiParam({
    name: "versionId",
    type: String,
    description: "ID của version muốn restore",
  })
  @ApiResponse({ status: 200, description: "Block đã được restore thành công" })
  @ApiResponse({
    status: 404,
    description: "Block hoặc version không tìm thấy",
  })
  @ApiResponse({ status: 403, description: "Không có quyền edit block" })
  async restoreVersion(
    @Param("blockId") blockId: string,
    @Param("versionId") versionId: string,
    @CurrentUser() user: any
  ) {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(blockId) || !uuidRegex.test(versionId)) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Verify block exists and get page
    const block = await this.blocksService.findOne(blockId);
    if (!block) {
      throw new NotFoundException("Block không tìm thấy");
    }

    // Check permission - user phải là member của workspace và có quyền edit (member, admin, owner)
    const userId = user.userId || user.sub;
    const hasPermission = await this.pagesService.checkUserPermission(
      block.pageId,
      userId,
      "member"
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        "Bạn không có quyền restore block này. Cần quyền member trở lên."
      );
    }

    try {
      const restoredBlock = await this.blockHistoryService.restore(
        blockId,
        versionId,
        userId
      );
      return restoredBlock;
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get(":blockId/history/compare")
  @ApiOperation({ summary: "So sánh 2 versions của block" })
  @ApiParam({ name: "blockId", type: String, description: "ID của block" })
  @ApiQuery({
    name: "version1",
    required: true,
    type: String,
    description: "ID của version 1",
  })
  @ApiQuery({
    name: "version2",
    required: true,
    type: String,
    description: "ID của version 2",
  })
  @ApiResponse({ status: 200, description: "Kết quả so sánh" })
  @ApiResponse({
    status: 404,
    description: "Block hoặc version không tìm thấy",
  })
  @ApiResponse({
    status: 400,
    description: "version1 và version2 không hợp lệ",
  })
  async compareVersions(
    @Param("blockId") blockId: string,
    @Query("version1") version1Id: string,
    @Query("version2") version2Id: string,
    @CurrentUser() user?: any
  ) {
    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (
      !uuidRegex.test(blockId) ||
      !uuidRegex.test(version1Id) ||
      !uuidRegex.test(version2Id)
    ) {
      throw new BadRequestException("ID không hợp lệ");
    }

    // Validate version1 và version2 phải khác nhau
    if (version1Id === version2Id) {
      throw new BadRequestException("version1 và version2 phải khác nhau");
    }

    // Verify block exists and get page
    const block = await this.blocksService.findOne(blockId);
    if (!block) {
      throw new NotFoundException("Block không tìm thấy");
    }

    // Check permission - user phải là member của workspace (viewer or above)
    const userId = user?.userId || user?.sub;
    if (userId) {
      const hasPermission = await this.pagesService.checkUserPermission(
        block.pageId,
        userId
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          "Bạn không có quyền so sánh versions của block này"
        );
      }
    }

    try {
      return await this.blockHistoryService.compare(
        blockId,
        version1Id,
        version2Id
      );
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}

