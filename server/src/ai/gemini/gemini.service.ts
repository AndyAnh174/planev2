import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(private configService: ConfigService) {
    const aiConfig = this.configService.get("ai");
    this.apiKey = aiConfig.gemini.apiKey;
    this.model = aiConfig.gemini.model;
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta";
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          timeout: 60000,
        }
      );

      return (
        response.data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      );
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate response from Gemini");
    }
  }
}

