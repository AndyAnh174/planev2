import { Injectable, Inject, forwardRef, Logger, NotFoundException } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { PagesService } from "../pages/pages.service";
import { BlocksService } from "../pages/blocks/blocks.service";
import { BoardsService } from "../boards/boards.service";
import { FilesService } from "../files/files.service";
import { WorkspaceMembersService } from "./workspace-members/workspace-members.service";
import { MinIOService } from "../files/minio.service";
import {
  WorkspaceExportData,
  PageExportData,
  BoardExportData,
  FileExportData,
} from "./dto/workspace-export.dto";

@Injectable()
export class WorkspaceExportService {
  private readonly logger = new Logger(WorkspaceExportService.name);

  constructor(
    private workspacesService: WorkspacesService,
    @Inject(forwardRef(() => PagesService))
    private pagesService: PagesService,
    @Inject(forwardRef(() => BlocksService))
    private blocksService: BlocksService,
    @Inject(forwardRef(() => BoardsService))
    private boardsService: BoardsService,
    @Inject(forwardRef(() => FilesService))
    private filesService: FilesService,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private workspaceMembersService: WorkspaceMembersService,
    private minioService: MinIOService
  ) {}

  /**
   * Export workspace data in structured format
   */
  async exportWorkspaceData(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceExportData> {
    // Validate permission
    await this.validateExportPermission(workspaceId, userId);

    // Collect all data
    const [workspace, pages, boards, files] = await Promise.all([
      this.collectWorkspace(workspaceId),
      this.collectPages(workspaceId),
      this.collectBoards(workspaceId),
      this.collectFiles(workspaceId),
    ]);

    return {
      workspace,
      pages,
      boards,
      files,
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
    };
  }

  /**
   * Validate user has permission to export workspace
   */
  async validateExportPermission(
    workspaceId: string,
    userId: string
  ): Promise<boolean> {
    const member = await this.workspaceMembersService.findMember(
      workspaceId,
      userId
    );

    if (!member) {
      throw new NotFoundException(
        "You are not a member of this workspace or workspace not found"
      );
    }

    return true;
  }

  /**
   * Collect workspace metadata
   */
  private async collectWorkspace(
    workspaceId: string
  ): Promise<WorkspaceExportData["workspace"]> {
    const workspace = await this.workspacesService.findOne(workspaceId);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const members = await this.workspaceMembersService.findAll(workspaceId);

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      avatarUrl: workspace.avatarUrl,
      ownerId: workspace.ownerId,
      owner: workspace.owner
        ? {
            id: workspace.owner.id,
            username: workspace.owner.username,
            email: workspace.owner.email,
          }
        : undefined,
      members: members.map((member) => ({
        userId: member.userId,
        role: member.role,
        user: member.user
          ? {
              id: member.user.id,
              username: member.user.username,
              email: member.user.email,
            }
          : undefined,
        joinedAt: member.joinedAt.toISOString(),
      })),
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
  }

  /**
   * Collect all pages with blocks
   */
  async collectPages(workspaceId: string): Promise<PageExportData[]> {
    const pages = await this.pagesService.findAll(workspaceId);

    const pagesWithBlocks = await Promise.all(
      pages.map(async (page) => {
        const pageWithBlocks = await this.pagesService.findOne(page.id);
        const blocks = pageWithBlocks?.blocks || [];

        // Sort blocks by orderIndex
        const sortedBlocks = blocks.sort(
          (a, b) => a.orderIndex - b.orderIndex
        );

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          visibility: page.visibility,
          authorId: page.authorId,
          author: page.author
            ? {
                id: page.author.id,
                username: page.author.username,
                email: page.author.email,
              }
            : undefined,
          isIndexed: page.isIndexed,
          blocks: sortedBlocks.map((block) => ({
            id: block.id,
            type: block.type,
            content: block.content,
            orderIndex: block.orderIndex,
            parentId: block.parentId,
            createdAt: block.createdAt.toISOString(),
            updatedAt: block.updatedAt.toISOString(),
          })),
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString(),
        };
      })
    );

    return pagesWithBlocks;
  }

  /**
   * Collect all boards with cards
   */
  async collectBoards(workspaceId: string): Promise<BoardExportData[]> {
    const boards = await this.boardsService.findAll(workspaceId);

    return boards.map((board) => {
      // Sort cards by orderIndex
      const sortedCards = (board.cards || []).sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      return {
        id: board.id,
        name: board.name,
        description: board.description,
        cards: sortedCards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
          status: card.columnId, // Using columnId as status
          orderIndex: card.orderIndex,
          assigneeId: card.assigneeId,
          assignee: card.assignee
            ? {
                id: card.assignee.id,
                username: card.assignee.username,
                email: card.assignee.email,
              }
            : undefined,
          dueDate: card.dueDate ? card.dueDate.toISOString() : undefined,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        })),
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
      };
    });
  }

  /**
   * Collect all files with binary content
   */
  async collectFiles(workspaceId: string): Promise<FileExportData[]> {
    const files = await this.filesService.findAll(workspaceId);

    const filesWithBinaries = await Promise.all(
      files.map(async (file) => {
        let binary: string | undefined;

        try {
          // Download file binary from MinIO
          const fileBuffer = await this.downloadFileBinary(file.minioPath);
          // Convert to base64
          binary = fileBuffer.toString("base64");
        } catch (error) {
          this.logger.warn(
            `Failed to download file ${file.id} (${file.minioPath}):`,
            error.message
          );
          // Continue without binary if download fails
        }

        return {
          id: file.id,
          filename: file.filename,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          minioPath: file.minioPath,
          uploaderId: file.uploaderId,
          uploader: file.uploader
            ? {
                id: file.uploader.id,
                username: file.uploader.username,
                email: file.uploader.email,
              }
            : undefined,
          binary,
          createdAt: file.createdAt.toISOString(),
        };
      })
    );

    return filesWithBinaries;
  }

  /**
   * Download file binary from MinIO
   */
  private async downloadFileBinary(minioPath: string): Promise<Buffer> {
    return await this.minioService.downloadFile(minioPath);
  }
}

