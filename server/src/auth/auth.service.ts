import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import Redis from "ioredis";
import { User } from "../users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { EmailService } from "../common/services/email.service";

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService
  ) {
    const redisConfig = this.configService.get("redis") || {};
    const redisUrl = redisConfig.url || process.env.REDIS_URL;
    
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    } else {
      this.redis = new Redis({
        host: redisConfig.host || process.env.REDIS_HOST || "localhost",
        port: redisConfig.port || parseInt(process.env.REDIS_PORT || "6379", 10),
      });
    }
  }

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

    // Store refresh token in Redis with TTL = 7 days
    const ttlSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.setex(`refresh:${user.id}`, ttlSeconds, refreshToken);

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

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    try {
      // 1. Verify refresh token JWT
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.sub;

      // 2. Check refresh token tồn tại trong Redis
      const storedToken = await this.redis.get(`refresh:${userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
      }

      // 3. Get user from database
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new UnauthorizedException("User không tồn tại");
      }

      // 4. Generate new access token và refresh token
      const jwtExpiration = (process.env.JWT_EXPIRATION || "15m") as any;
      const refreshExpiration = (process.env.REFRESH_TOKEN_EXPIRATION || "7d") as any;
      
      const newPayload = { sub: user.id, email: user.email };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: jwtExpiration,
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: refreshExpiration,
      });

      // 5. Token rotation: Xóa refresh token cũ, lưu refresh token mới vào Redis
      await this.redis.del(`refresh:${userId}`);
      const ttlSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
      await this.redis.setex(`refresh:${userId}`, ttlSeconds, newRefreshToken);

      // 6. Return tokens mới
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Refresh token không hợp lệ");
    }
  }

  async logout(userId: string): Promise<void> {
    // Invalidate refresh token trong Redis
    await this.redis.del(`refresh:${userId}`);
  }

  /**
   * Request password reset - send reset token via email
   */
  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await this.usersRepository.findOne({ where: { email } });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user || !user.passwordHash) {
      // Return success even if user doesn't exist to prevent email enumeration
      return;
    }

    // Generate reset token (JWT with short expiration - 15 minutes)
    const resetPayload = { sub: user.id, email: user.email, type: "password-reset" };
    const resetToken = this.jwtService.sign(resetPayload, {
      expiresIn: "15m",
    });

    // Store token in Redis with TTL 15 minutes
    const ttlSeconds = 15 * 60; // 15 minutes in seconds
    await this.redis.setex(`password-reset:${user.id}`, ttlSeconds, resetToken);

    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Verify token
      const payload = this.jwtService.verify(token);
      
      // Check token type
      if (payload.type !== "password-reset") {
        throw new BadRequestException("Invalid token type");
      }

      const userId = payload.sub;

      // Check token exists in Redis
      const storedToken = await this.redis.get(`password-reset:${userId}`);
      if (!storedToken || storedToken !== token) {
        throw new BadRequestException("Reset token không hợp lệ hoặc đã hết hạn");
      }

      // Get user
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException("User không tồn tại");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await this.usersRepository.update(userId, { passwordHash: hashedPassword });

      // Invalidate token
      await this.redis.del(`password-reset:${userId}`);

      // Also invalidate all refresh tokens for security (user should re-login)
      await this.redis.del(`refresh:${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // JWT verification errors
      throw new BadRequestException("Reset token không hợp lệ hoặc đã hết hạn");
    }
  }
}

