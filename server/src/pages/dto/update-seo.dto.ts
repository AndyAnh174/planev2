import { IsBoolean, IsOptional } from "class-validator";

export class UpdateSeoDto {
  @IsBoolean()
  @IsOptional()
  isIndexed?: boolean;
}

