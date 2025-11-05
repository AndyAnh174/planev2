import { Controller, Get, Param, UseGuards, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "Tìm kiếm users với pagination" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search by username or email" })
  @ApiQuery({ name: "limit", required: false, type: Number, description: "Number of results per page (default: 20)" })
  @ApiQuery({ name: "offset", required: false, type: Number, description: "Number of results to skip (default: 0)" })
  @ApiResponse({ status: 200, description: "Danh sách users" })
  findAll(
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.usersService.findAll(search, limitNum, offsetNum);
  }

  @Get("me")
  @ApiOperation({ summary: "Lấy thông tin user hiện tại" })
  @ApiResponse({ status: 200, description: "Thông tin user" })
  getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId || user.sub);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin user theo ID" })
  @ApiResponse({ status: 200, description: "Thông tin user" })
  @ApiResponse({ status: 404, description: "User không tìm thấy" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }
}

