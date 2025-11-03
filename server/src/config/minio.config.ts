import { registerAs } from "@nestjs/config";

export default registerAs("minio", () => ({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  bucket: process.env.MINIO_BUCKET || "notion-files",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  useSSL: false, // Disabled - using Cloudflare Zero Trust
}));

