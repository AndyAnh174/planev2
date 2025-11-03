import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from "class-validator";

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsOptional()
  orderIndex?: number;
}

