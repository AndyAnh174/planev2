import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import type { CommentTargetType } from "../entities/comment.entity";

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(["page", "block", "card"])
  @IsNotEmpty()
  targetType: CommentTargetType;

  @IsString()
  @IsNotEmpty()
  targetId: string;
}

