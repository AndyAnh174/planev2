import { Injectable, Inject, forwardRef, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Page, PageVisibility } from "./entities/page.entity";
import { PageHistoryService } from "./page-history/page-history.service";
import { WorkspaceMembersService } from "../workspaces/workspace-members/workspace-members.service";
import { WorkspaceRole } from "../workspaces/entities/workspace-member.entity";

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @Optional()
    @Inject(forwardRef(() => PageHistoryService))
    private pageHistoryService?: PageHistoryService,
    @Optional()
    @Inject(forwardRef(() => WorkspaceMembersService))
    private workspaceMembersService?: WorkspaceMembersService
  ) {}

  async create(createDto: Partial<Page>, workspaceId: string, authorId: string) {
    // Generate slug if not provided
    let slug = createDto.slug;
    if (!slug) {
      slug = createDto.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `page-${Date.now()}`;
    }

    // Ensure slug is unique in workspace
    const existingPage = await this.pageRepository.findOne({
      where: { workspaceId, slug },
    });
    if (existingPage) {
      slug = `${slug}-${Date.now()}`;
    }

    const page = this.pageRepository.create({
      ...createDto,
      slug,
      workspaceId,
      authorId,
    });
    return this.pageRepository.save(page);
  }

  async findAll(workspaceId: string) {
    return this.pageRepository.find({
      where: { workspaceId },
      relations: ["author"],
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(id: string) {
    return this.pageRepository.findOne({
      where: { id },
      relations: ["blocks", "author", "workspace"],
    });
  }

  async findBySlug(slug: string) {
    return this.pageRepository.findOne({
      where: { slug, visibility: "public" },
      relations: ["blocks", "author"],
    });
  }

  async update(id: string, updateDto: Partial<Page>, authorId?: string) {
    // Get current page state before update
    const currentPage = await this.findOne(id);
    if (!currentPage) {
      throw new Error("Page not found");
    }

    // Update page
    await this.pageRepository.update(id, updateDto);
    const updatedPage = await this.findOne(id);

    // Auto-create history snapshot if PageHistoryService is available
    if (this.pageHistoryService && authorId) {
      try {
        const contentSnapshot = {
          page: {
            title: currentPage.title,
            slug: currentPage.slug,
            visibility: currentPage.visibility,
            isIndexed: currentPage.isIndexed,
          },
          blocks: currentPage.blocks?.map((block) => ({
            id: block.id,
            type: block.type,
            content: block.content,
            orderIndex: block.orderIndex,
            parentId: block.parentId,
          })) || [],
        };
        await this.pageHistoryService.create(id, contentSnapshot, authorId);
      } catch (error) {
        // Log error but don't fail the update
        console.error("Failed to create page history snapshot:", error);
      }
    }

    return updatedPage;
  }

  async publish(id: string, slug?: string, isIndexed: boolean = false) {
    const page = await this.findOne(id);
    if (!page) throw new Error("Page not found");
    
    const updatedSlug = slug || `p-${Date.now()}`;
    return this.update(id, {
      visibility: "public" as PageVisibility,
      slug: updatedSlug,
      isIndexed,
    });
  }

  async unpublish(id: string) {
    return this.update(id, {
      visibility: "private" as PageVisibility,
      isIndexed: false,
    });
  }

  async updateSeo(id: string, isIndexed: boolean) {
    return this.update(id, { isIndexed });
  }

  async findIndexedPages(): Promise<Page[]> {
    return this.pageRepository.find({
      where: {
        visibility: "public",
        isIndexed: true,
      },
      relations: ["author"],
      order: { updatedAt: "DESC" },
    });
  }

  async remove(id: string) {
    await this.pageRepository.delete(id);
  }

  async checkUserPermission(
    pageId: string,
    userId: string,
    requiredRole?: WorkspaceRole
  ): Promise<boolean> {
    const page = await this.findOne(pageId);
    if (!page) {
      return false;
    }

    if (!this.workspaceMembersService) {
      // If service not available, allow access (for testing)
      return true;
    }

    const member = await this.workspaceMembersService.findMember(
      page.workspaceId,
      userId
    );

    if (!member) {
      return false;
    }

    if (!requiredRole) {
      // Just check if user is a member (viewer or above)
      return true;
    }

    const roleHierarchy: Record<WorkspaceRole, number> = {
      viewer: 1,
      member: 2,
      admin: 3,
      owner: 4,
    };

    const userRoleLevel = roleHierarchy[member.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  }
}

