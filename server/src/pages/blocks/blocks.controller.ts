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
import { BlocksService } from "./blocks.service";
import { CreateBlockDto } from "./dto/create-block.dto";
import { UpdateBlockDto } from "./dto/update-block.dto";

@ApiTags("pages")
@ApiBearerAuth("JWT-auth")
@Controller("blocks")
@UseGuards(AuthGuard("jwt"))
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  @Post()
  @ApiOperation({ summary: "Tạo block mới" })
  @ApiQuery({ name: "pageId", required: true, type: String })
  @ApiResponse({ status: 201, description: "Block đã được tạo" })
  create(@Body() createDto: CreateBlockDto, @Query("pageId") pageId: string) {
    return this.blocksService.create(createDto, pageId);
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách blocks trong page" })
  @ApiQuery({ name: "pageId", required: true, type: String })
  @ApiResponse({ status: 200, description: "Danh sách blocks" })
  findAll(@Query("pageId") pageId: string) {
    return this.blocksService.findAll(pageId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Lấy thông tin block theo ID" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Thông tin block" })
  findOne(@Param("id") id: string) {
    return this.blocksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Cập nhật block" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Block đã được cập nhật" })
  update(@Param("id") id: string, @Body() updateDto: UpdateBlockDto) {
    return this.blocksService.update(id, updateDto);
  }

  @Post("reorder")
  @ApiOperation({ summary: "Sắp xếp lại thứ tự blocks" })
  @ApiResponse({ status: 200, description: "Thứ tự blocks đã được cập nhật" })
  updateOrder(@Body() body: { blockIds: string[] }) {
    return this.blocksService.updateOrder(body.blockIds);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa block" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Block đã được xóa" })
  remove(@Param("id") id: string) {
    return this.blocksService.remove(id);
  }
}

