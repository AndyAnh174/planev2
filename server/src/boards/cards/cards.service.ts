import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Card } from "./entities/card.entity";
import { CreateCardDto } from "./dto/create-card.dto";

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>
  ) {}

  async create(createDto: CreateCardDto | Partial<Card>, boardId: string) {
    const cardData: any = {
      ...createDto,
      boardId,
    };
    
    // Convert string date to Date if provided
    if (createDto.dueDate && typeof createDto.dueDate === "string") {
      cardData.dueDate = new Date(createDto.dueDate);
    }
    
    const card = this.cardRepository.create(cardData);
    return this.cardRepository.save(card);
  }

  async findAll(boardId: string) {
    return this.cardRepository.find({
      where: { boardId },
      relations: ["assignee"],
      order: { orderIndex: "ASC" },
    });
  }

  async findByColumn(boardId: string, columnId: string) {
    return this.cardRepository.find({
      where: { boardId, columnId },
      relations: ["assignee"],
      order: { orderIndex: "ASC" },
    });
  }

  async findOne(id: string) {
    return this.cardRepository.findOne({
      where: { id },
      relations: ["assignee", "board"],
    });
  }

  async update(id: string, updateDto: Partial<Card> | Partial<CreateCardDto>) {
    const updateData: any = { ...updateDto };
    
    // Convert string date to Date if provided
    if (updateDto.dueDate && typeof updateDto.dueDate === "string") {
      updateData.dueDate = new Date(updateDto.dueDate);
    }
    
    await this.cardRepository.update(id, updateData);
    return this.findOne(id);
  }

  async moveCard(cardId: string, columnId: string, orderIndex: number) {
    await this.cardRepository.update(cardId, {
      columnId,
      orderIndex,
    });
    return this.findOne(cardId);
  }

  async remove(id: string) {
    await this.cardRepository.delete(id);
  }
}

