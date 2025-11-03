import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment, CommentTargetType } from "./entities/comment.entity";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>
  ) {}

  async create(
    createDto: Partial<Comment>,
    targetType: CommentTargetType,
    targetId: string,
    authorId: string
  ) {
    const comment = this.commentRepository.create({
      ...createDto,
      targetType,
      targetId,
      authorId,
    });
    return this.commentRepository.save(comment);
  }

  async findAll(targetType: CommentTargetType, targetId: string) {
    return this.commentRepository.find({
      where: { targetType, targetId },
      relations: ["author"],
      order: { createdAt: "ASC" },
    });
  }

  async findOne(id: string) {
    return this.commentRepository.findOne({
      where: { id },
      relations: ["author"],
    });
  }

  async update(id: string, updateDto: Partial<Comment>) {
    await this.commentRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.commentRepository.delete(id);
  }
}

