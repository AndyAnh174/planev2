import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Page, PageVisibility } from "./entities/page.entity";

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>
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

  async update(id: string, updateDto: Partial<Page>) {
    await this.pageRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async publish(id: string, slug?: string) {
    const page = await this.findOne(id);
    if (!page) throw new Error("Page not found");
    
    const updatedSlug = slug || `p-${Date.now()}`;
    return this.update(id, {
      visibility: "public" as PageVisibility,
      slug: updatedSlug,
    });
  }

  async unpublish(id: string) {
    return this.update(id, {
      visibility: "private" as PageVisibility,
    });
  }

  async remove(id: string) {
    await this.pageRepository.delete(id);
  }
}

