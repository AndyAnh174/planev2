import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

