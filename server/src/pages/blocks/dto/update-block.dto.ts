import { IsOptional, IsObject, IsNumber } from "class-validator";

export class UpdateBlockDto {
  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

