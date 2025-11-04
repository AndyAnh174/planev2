import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Block, BlockType } from "./entities/block.entity";

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    private dataSource: DataSource
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

  /**
   * Batch update multiple blocks in a transaction
   * @param updates Array of {id, data} objects to update
   * @returns Array of updated Block entities
   */
  async updateBatch(
    updates: Array<{ id: string; data: Partial<Block> }>
  ): Promise<Block[]> {
    if (updates.length === 0) {
      return [];
    }

    // Use transaction to ensure atomic updates
    return await this.dataSource.transaction(async (manager) => {
      const blockRepository = manager.getRepository(Block);
      const updatedBlocks: Block[] = [];

      for (const update of updates) {
        await blockRepository.update(update.id, update.data);
        const updatedBlock = await blockRepository.findOne({
          where: { id: update.id },
        });
        if (updatedBlock) {
          updatedBlocks.push(updatedBlock);
        }
      }

      return updatedBlocks;
    });
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

