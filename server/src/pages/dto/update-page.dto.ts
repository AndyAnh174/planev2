import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import type { PageVisibility } from "../entities/page.entity";

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(["private", "workspace", "public"])
  @IsOptional()
  visibility?: PageVisibility;

  @IsBoolean()
  @IsOptional()
  isIndexed?: boolean;
}

