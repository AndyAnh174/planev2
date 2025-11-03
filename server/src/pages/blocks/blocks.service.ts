import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Block, BlockType } from "./entities/block.entity";

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>
  ) {}

  async create(createDto: Partial<Block>, pageId: string) {
    const block = this.blockRepository.create({
      ...createDto,
      pageId,
    });
    return this.blockRepository.save(block);
  }

  async findAll(pageId: string) {
    return this.blockRepository.find({
      where: { pageId },
      order: { orderIndex: "ASC" },
    });
  }

  async findOne(id: string) {
    return this.blockRepository.findOne({ where: { id } });
  }

  async update(id: string, updateDto: Partial<Block>) {
    await this.blockRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async updateOrder(blockIds: string[]) {
    const updatePromises = blockIds.map((id, index) =>
      this.blockRepository.update(id, { orderIndex: index })
    );
    await Promise.all(updatePromises);
    return this.blockRepository
      .createQueryBuilder()
      .where("id IN (:...ids)", { ids: blockIds })
      .getMany();
  }

  async remove(id: string) {
    await this.blockRepository.delete(id);
  }
}

