import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as MinIO from "minio";

@Injectable()
export class MinIOService {
  private client: MinIO.Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const minioConfig = this.configService.get("minio");
    const endpoint = minioConfig.endpoint;
    const url = new URL(endpoint);
    
    this.client = new MinIO.Client({
      endPoint: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 9000,
      useSSL: false, // Disabled - using Cloudflare Zero Trust
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
    this.bucket = minioConfig.bucket;
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, "us-east-1");
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    workspaceId: string
  ): Promise<string> {
    const fileName = `${workspaceId}/${Date.now()}-${file.originalname}`;

    await this.client.putObject(
      this.bucket,
      fileName,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      }
    );

    const endpoint = this.configService.get<string>("minio.endpoint");
    const url = `${endpoint}/${this.bucket}/${fileName}`;
    return url;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.client.removeObject(this.bucket, fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    const endpoint = this.configService.get<string>("minio.endpoint");
    return `${endpoint}/${this.bucket}/${fileName}`;
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise(async (resolve, reject) => {
      try {
        const dataStream = await this.client.getObject(this.bucket, fileName);
        
        dataStream.on("data", (chunk) => {
          chunks.push(chunk);
        });

        dataStream.on("end", () => {
          resolve(Buffer.concat(chunks));
        });

        dataStream.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

