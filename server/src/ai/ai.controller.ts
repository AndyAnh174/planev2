import { Controller, Post, Body, UseGuards, Query, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { AIService } from "./ai.service";
import { AIRateLimitInterceptor } from "../common/interceptors/ai-rate-limit.interceptor";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("ai")
@ApiBearerAuth("JWT-auth")
@Controller("ai")
@UseInterceptors(AIRateLimitInterceptor)
export class AIController {
  constructor(private aiService: AIService) {}

  @Post("summarize")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Tóm tắt nội dung" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Nội dung cần tóm tắt" },
      },
      required: ["content"],
    },
  })
  @ApiResponse({ status: 200, description: "Nội dung đã được tóm tắt" })
  async summarize(
    @Body() body: { content: string },
    @CurrentUser() user: any
  ) {
    const userId = user?.userId || user?.sub;
    return { result: await this.aiService.summarize(body.content, userId) };
  }

  @Post("brainstorm")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Brainstorm ý tưởng" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Chủ đề cần brainstorm" },
      },
      required: ["topic"],
    },
  })
  @ApiResponse({ status: 200, description: "Danh sách ý tưởng" })
  async brainstorm(
    @Body() body: { topic: string },
    @CurrentUser() user: any
  ) {
    const userId = user?.userId || user?.sub;
    return { result: await this.aiService.brainstorm(body.topic, userId) };
  }

  @Post("translate")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Dịch nội dung" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Nội dung cần dịch" },
        targetLanguage: {
          type: "string",
          description: "Ngôn ngữ đích (ví dụ: vi, en)",
          default: "vi",
        },
      },
      required: ["content"],
    },
  })
  @ApiResponse({ status: 200, description: "Nội dung đã được dịch" })
  async translate(
    @Body() body: { content: string; targetLanguage?: string },
    @CurrentUser() user: any
  ) {
    const userId = user?.userId || user?.sub;
    return {
      result: await this.aiService.translate(
        body.content,
        body.targetLanguage,
        userId
      ),
    };
  }

  @Post("ask")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Hỏi đáp với AI (RAG)",
    description: "Sử dụng RAG để trả lời câu hỏi dựa trên dữ liệu trong workspace",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Câu hỏi" },
      },
      required: ["query"],
    },
  })
  @ApiQuery({
    name: "workspaceId",
    required: true,
    description: "ID của workspace",
  })
  @ApiResponse({ status: 200, description: "Câu trả lời từ AI" })
  async ask(
    @Body() body: { query: string },
    @Query("workspaceId") workspaceId: string,
    @CurrentUser() user: any
  ) {
    const userId = user?.userId || user?.sub;
    return { result: await this.aiService.ask(body.query, workspaceId, userId) };
  }
}

