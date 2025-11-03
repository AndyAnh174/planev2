import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Workspace } from "./entities/workspace.entity";

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>
  ) {}

  async create(createDto: Partial<Workspace>, ownerId: string) {
    // Generate slug if not provided
    let slug = createDto.slug;
    if (!slug) {
      slug = createDto.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `workspace-${Date.now()}`;
    }

    // Ensure slug is unique
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { slug },
    });
    if (existingWorkspace) {
      slug = `${slug}-${Date.now()}`;
    }

    const workspace = this.workspaceRepository.create({
      ...createDto,
      slug,
      ownerId,
    });
    return this.workspaceRepository.save(workspace);
  }

  async findAll(userId: string) {
    return this.workspaceRepository
      .createQueryBuilder("workspace")
      .innerJoin("workspace.members", "member")
      .where("member.userId = :userId", { userId })
      .getMany();
  }

  async findOne(id: string) {
    return this.workspaceRepository.findOne({
      where: { id },
      relations: ["members", "owner"],
    });
  }

  async update(id: string, updateDto: Partial<Workspace>) {
    await this.workspaceRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.workspaceRepository.delete(id);
  }
}

