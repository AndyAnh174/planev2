import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { CardsService } from "./cards.service";
import { CreateCardDto } from "./dto/create-card.dto";

@ApiTags("boards")
@ApiBearerAuth("JWT-auth")
@Controller("cards")
@UseGuards(AuthGuard("jwt"))
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Post()
  @ApiOperation({ summary: "Tạo card mới" })
  @ApiQuery({ name: "boardId", required: true, type: String })
  @ApiResponse({ status: 201, description: "Card đã được tạo" })
  create(@Body() createDto: CreateCardDto, @Query("boardId") boardId: string) {
    return this.cardsService.create(createDto, boardId);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách cards" })
  @ApiQuery({ name: "boardId", required: true, type: String })
  @ApiQuery({ name: "columnId", required: false, type: String })
  @ApiResponse({ status: 200, description: "Danh sách cards" })
  findAll(@Query("boardId") boardId: string, @Query("columnId") columnId?: string) {
    if (columnId) {
      return this.cardsService.findByColumn(boardId, columnId);
    }
    return this.cardsService.findAll(boardId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin card theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin card" })
  findOne(@Param("id") id: string) {
    return this.cardsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật card" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Card đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: Partial<CreateCardDto>) {
    return this.cardsService.update(id, updateDto);
  }

  @Post(":id/move")
  @ApiOperation({ summary: "Di chuyển card sang column khác" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Card đã được di chuyển" })
  moveCard(
    @Param("id") id: string,
    @Body() body: { columnId: string; orderIndex: number }
  ) {
    return this.cardsService.moveCard(id, body.columnId, body.orderIndex);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa card" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Card đã được xóa" })
  remove(@Param("id") id: string) {
    return this.cardsService.remove(id);
  }
}

