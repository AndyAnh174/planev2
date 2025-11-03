import { IsString, IsOptional } from "class-validator";

export class PublishPageDto {
  @IsString()
  @IsOptional()
  slug?: string;
}

