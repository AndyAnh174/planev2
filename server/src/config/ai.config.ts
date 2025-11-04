import { registerAs } from "@nestjs/config";

export default registerAs("ai", () => ({
  provider: process.env.AI_PROVIDER || "none",
  llama: {
    host: process.env.LLAMA_HOST || "https://222.253.80.30:11434",
    model: process.env.LLAMA_MODEL || "llama3.1:8b",
    rateLimit: {
      maxRequests: parseInt(process.env.AI_RATE_LIMIT_OLLAMA_MAX_REQUESTS || "10", 10),
      windowMs: parseInt(process.env.AI_RATE_LIMIT_OLLAMA_WINDOW_MS || "60000", 10),
    },
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    rateLimit: {
      maxRequests: parseInt(process.env.AI_RATE_LIMIT_GEMINI_MAX_REQUESTS || "15", 10),
      windowMs: parseInt(process.env.AI_RATE_LIMIT_GEMINI_WINDOW_MS || "60000", 10),
    },
  },
  embedding: {
    apiUrl:
      process.env.EMBEDDING_API_URL || "https://embed.andyanh.id.vn/embed",
    model: process.env.EMBEDDING_MODEL || "BAAI/bge-m3",
    maxLength: parseInt(process.env.EMBEDDING_MAX_LENGTH || "512", 10),
    dimension: parseInt(process.env.EMBEDDING_DIMENSION || "1024", 10),
  },
}));

