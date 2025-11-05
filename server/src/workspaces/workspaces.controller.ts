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
  Res,
  HttpStatus,
  BadRequestException,
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
import type { Response } from "express";
import { WorkspacesService } from "./workspaces.service";
import { WorkspaceExportService } from "./workspace-export.service";
import { PDFGenerationService } from "../common/services/pdf-generation.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces")
@UseGuards(AuthGuard("jwt"))
export class WorkspacesController {
  constructor(
    private workspacesService: WorkspacesService,
    private workspaceExportService: WorkspaceExportService,
    private pdfGenerationService: PDFGenerationService
  ) {}

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

  @Get(":id/export")
  @ApiOperation({
    summary: "Export workspace data",
    description:
      "Export workspace data including pages, boards, and files in JSON or PDF format. File binaries are included in JSON export.",
  })
  @ApiParam({ name: "id", type: String, description: "Workspace ID" })
  @ApiQuery({
    name: "format",
    enum: ["json", "pdf"],
    required: false,
    description: "Export format (default: json)",
    example: "json",
  })
  @ApiResponse({
    status: 200,
    description: "Workspace export data",
    content: {
      "application/json": {
        schema: {
          type: "object",
          description: "JSON export format",
        },
      },
      "application/pdf": {
        schema: {
          type: "string",
          format: "binary",
          description: "PDF export format",
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Invalid format parameter" })
  @ApiResponse({ status: 404, description: "Workspace not found or permission denied" })
  async export(
    @Param("id") id: string,
    @Query("format") format: string = "json",
    @CurrentUser() user: any,
    @Res() res: Response
  ) {
    const userId = user.userId || user.sub;

    // Validate format
    if (format && format !== "json" && format !== "pdf") {
      throw new BadRequestException(
        "Invalid format. Must be 'json' or 'pdf'"
      );
    }

    try {
      // Export workspace data
      const exportData = await this.workspaceExportService.exportWorkspaceData(
        id,
        userId
      );

      if (format === "pdf") {
        // Generate PDF
        const pdfBuffer = await this.pdfGenerationService.generateWorkspacePDF(
          exportData
        );

        // Set PDF response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="workspace-${exportData.workspace.slug}-${Date.now()}.pdf"`
        );
        res.setHeader("Content-Length", pdfBuffer.length.toString());

        return res.send(pdfBuffer);
      } else {
        // Return JSON
        return res.json(exportData);
      }
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to export workspace: ${error.message}`
      );
    }
  }
}

