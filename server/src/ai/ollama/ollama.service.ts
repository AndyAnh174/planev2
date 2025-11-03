import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class OllamaService {
  private baseURL: string;
  private model: string;

  constructor(private configService: ConfigService) {
    const aiConfig = this.configService.get("ai");
    this.baseURL = aiConfig.llama.host;
    this.model = aiConfig.llama.model;
  }

  async generate(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
        },
        {
          timeout: 300000, // 5 minutes timeout
        }
      );
      return response.data.response || "";
    } catch (error) {
      console.error("Ollama API error:", error);
      throw new Error("Failed to generate response from Ollama");
    }
  }
}

