import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "./entities/board.entity";

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>
  ) {}

  async create(createDto: Partial<Board>, workspaceId: string) {
    const board = this.boardRepository.create({
      ...createDto,
      workspaceId,
    });
    return this.boardRepository.save(board);
  }

  async findAll(workspaceId: string) {
    return this.boardRepository.find({
      where: { workspaceId },
      relations: ["cards"],
      order: { updatedAt: "DESC" },
    });
  }

  async findOne(id: string) {
    return this.boardRepository.findOne({
      where: { id },
      relations: ["cards", "workspace"],
    });
  }

  async update(id: string, updateDto: Partial<Board>) {
    await this.boardRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.boardRepository.delete(id);
  }
}

