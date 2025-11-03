import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: User) {
    const payload = { sub: user.id, email: user.email };
    const jwtExpiration = (process.env.JWT_EXPIRATION || "15m") as any;
    const refreshExpiration = (process.env.REFRESH_TOKEN_EXPIRATION || "7d") as any;
    
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtExpiration,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiration,
    });

    // TODO: Store refresh token in Redis

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email đã được sử dụng");
    }

    // Check if username already exists
    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException("Tên người dùng đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.login(savedUser);
  }

  async validateGitLabUser(gitlabId: string, email: string): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { gitlabId } });
    if (!user) {
      user = this.usersRepository.create({ gitlabId, email });
      user = await this.usersRepository.save(user);
    }
    return user;
  }
}

