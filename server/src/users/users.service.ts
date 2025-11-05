import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(search?: string, limit?: number, offset?: number): Promise<{ users: User[]; total: number }> {
    const queryBuilder = this.usersRepository.createQueryBuilder("user");

    if (search) {
      queryBuilder.where(
        "(user.username ILIKE :search OR user.email ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    const total = await queryBuilder.getCount();

    if (limit !== undefined) {
      queryBuilder.limit(limit);
    }
    if (offset !== undefined) {
      queryBuilder.offset(offset);
    }

    const users = await queryBuilder.getMany();

    return { users, total };
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGitLabId(gitlabId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { gitlabId } });
  }
}

