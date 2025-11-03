import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkspaceMember, WorkspaceRole } from "../entities/workspace-member.entity";

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private memberRepository: Repository<WorkspaceMember>
  ) {}

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ): Promise<WorkspaceMember> {
    // Check if member already exists
    const existing = await this.findMember(workspaceId, userId);
    if (existing) {
      return existing;
    }

    const member = this.memberRepository.create({
      workspaceId,
      userId,
      role,
    });
    return this.memberRepository.save(member);
  }

  async findAll(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.memberRepository.find({
      where: { workspaceId },
      relations: ["user"],
    });
  }

  async findMember(workspaceId: string, userId: string) {
    return this.memberRepository.findOne({
      where: { workspaceId, userId },
      relations: ["user"],
    });
  }

  async updateRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole
  ) {
    await this.memberRepository.update({ workspaceId, userId }, { role });
    return this.findMember(workspaceId, userId);
  }

  async removeMember(workspaceId: string, userId: string) {
    await this.memberRepository.delete({ workspaceId, userId });
  }
}

