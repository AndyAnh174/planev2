import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OllamaService } from "./ollama/ollama.service";
import { GeminiService } from "./gemini/gemini.service";
import { RAGService } from "./rag/rag.service";

@Injectable()
export class AIService {
  private provider: string;

  constructor(
    private configService: ConfigService,
    private ollamaService: OllamaService,
    private geminiService: GeminiService,
    private ragService: RAGService
  ) {
    this.provider = this.configService.get<string>("ai.provider") || "none";
  }

  private getProviderService() {
    if (this.provider === "ollama") {
      return this.ollamaService;
    } else if (this.provider === "gemini") {
      return this.geminiService;
    }
    throw new Error("AI provider not configured");
  }

  async summarize(content: string): Promise<string> {
    const prompt = `Tóm tắt nội dung sau bằng tiếng Việt:\n\n${content}`;
    return this.getProviderService().generate(prompt);
  }

  async brainstorm(topic: string): Promise<string> {
    const prompt = `Sinh ý tưởng và gợi ý cho chủ đề: ${topic}. Trả lời bằng tiếng Việt.`;
    return this.getProviderService().generate(prompt);
  }

  async translate(content: string, targetLanguage: string = "en"): Promise<string> {
    const prompt = `Dịch nội dung sau sang ${targetLanguage}:\n\n${content}`;
    return this.getProviderService().generate(prompt);
  }

  async ask(query: string, workspaceId: string): Promise<string> {
    const context = await this.ragService.search(query, workspaceId);
    const prompt = `Dựa vào ngữ cảnh sau, trả lời câu hỏi bằng tiếng Việt:\n\nNgữ cảnh:\n${context}\n\nCâu hỏi: ${query}`;
    return this.getProviderService().generate(prompt);
  }
}

