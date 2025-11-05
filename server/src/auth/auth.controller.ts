import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Public } from "./decorators/public.decorator";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Đăng nhập với email và password" })
  @ApiResponse({ status: 200, description: "Đăng nhập thành công" })
  @ApiResponse({ status: 401, description: "Email hoặc mật khẩu không đúng" })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }
    return this.authService.login(user);
  }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Đăng ký tài khoản mới" })
  @ApiResponse({ status: 201, description: "Đăng ký thành công" })
  @ApiResponse({ status: 409, description: "Email hoặc username đã tồn tại" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get("gitlab")
  @UseGuards(AuthGuard("gitlab"))
  @ApiOperation({ summary: "Đăng nhập bằng GitLab OAuth" })
  @ApiResponse({ status: 302, description: "Redirect to GitLab" })
  async gitlabAuth() {
    // Passport will redirect to GitLab
  }

  @Public()
  @Get("gitlab/callback")
  @UseGuards(AuthGuard("gitlab"))
  @ApiOperation({ summary: "GitLab OAuth callback" })
  @ApiResponse({ status: 302, description: "Redirect to frontend with token" })
  async gitlabCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const result = await this.authService.login(user);
    
    // Redirect to frontend with both tokens
    const frontendUrl = process.env.APP_URL || "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`
    );
  }

  @Get("profile")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Lấy thông tin user hiện tại" })
  @ApiResponse({ status: 200, description: "Thông tin user" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post("refresh")
  @Public()
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token đã được refresh" })
  @ApiResponse({ status: 401, description: "Refresh token không hợp lệ hoặc đã hết hạn" })
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException("Refresh token là bắt buộc");
    }
    return this.authService.refresh(body.refreshToken);
  }

  @Post("logout")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Đăng xuất và invalidate refresh token" })
  @ApiResponse({ status: 200, description: "Đăng xuất thành công" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(@CurrentUser() user: any) {
    const userId = user.userId || user.sub;
    await this.authService.logout(userId);
    return { message: "Đăng xuất thành công" };
  }

  @Public()
  @Post("forgot-password")
  @ApiOperation({ summary: "Yêu cầu reset password" })
  @ApiResponse({ status: 200, description: "Email reset password đã được gửi (nếu email tồn tại)" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    // Always return success to prevent email enumeration
    return {
      message: "Nếu email tồn tại, chúng tôi đã gửi link reset password đến email của bạn.",
    };
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ summary: "Reset password với token" })
  @ApiResponse({ status: 200, description: "Password đã được reset thành công" })
  @ApiResponse({ status: 400, description: "Token không hợp lệ hoặc đã hết hạn" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );
    return { message: "Password đã được reset thành công. Vui lòng đăng nhập lại." };
  }
}

