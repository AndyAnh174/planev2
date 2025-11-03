import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import type { PageVisibility } from "../entities/page.entity";

export class CreatePageDto {
  @ApiProperty({ example: "My Page", description: "Tiêu đề của page" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "my-page", description: "Slug của page (tự động tạo nếu không có)", required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ 
    example: "private", 
    enum: ["private", "workspace", "public"],
    description: "Quyền truy cập page",
    required: false,
    default: "private"
  })
  @IsEnum(["private", "workspace", "public"])
  @IsOptional()
  visibility?: PageVisibility;

  @ApiProperty({ example: "uuid-here", description: "ID của workspace" })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

