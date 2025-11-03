import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsObject } from "class-validator";
import type { BlockType } from "../entities/block.entity";

export class CreateBlockDto {
  @IsEnum([
    "text",
    "heading",
    "code",
    "table",
    "checklist",
    "image",
    "embed",
    "quote",
    "divider",
  ])
  @IsNotEmpty()
  type: BlockType;

  @IsObject()
  @IsNotEmpty()
  content: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @IsString()
  @IsOptional()
  parentId?: string;
}

