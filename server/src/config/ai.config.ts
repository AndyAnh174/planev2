import { registerAs } from "@nestjs/config";

export default registerAs("ai", () => ({
  provider: process.env.AI_PROVIDER || "none",
  llama: {
    host: process.env.LLAMA_HOST || "https://222.253.80.30:11434",
    model: process.env.LLAMA_MODEL || "llama3.1:8b",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },
  embedding: {
    apiUrl:
      process.env.EMBEDDING_API_URL || "https://embed.andyanh.id.vn/embed",
    model: process.env.EMBEDDING_MODEL || "BAAI/bge-m3",
    maxLength: parseInt(process.env.EMBEDDING_MAX_LENGTH || "512", 10),
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || "1024", 10),
  },
}));

