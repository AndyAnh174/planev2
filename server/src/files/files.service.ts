import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FileUpload } from "./entities/file-upload.entity";
import { MinIOService } from "./minio.service";

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileUpload)
    private fileRepository: Repository<FileUpload>,
    private minioService: MinIOService
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    workspaceId: string,
    uploaderId: string
  ): Promise<FileUpload> {
    if (!file || !file.buffer) {
      throw new Error("File is required");
    }

    const url = await this.minioService.uploadFile(file, workspaceId);
    const pathParts = url.split("/");
    const minioPath = pathParts.slice(-2).join("/");

    const fileUpload = this.fileRepository.create({
      workspaceId,
      uploaderId,
      filename: `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      minioPath,
      url,
    });

    return this.fileRepository.save(fileUpload);
  }

  async findAll(workspaceId: string) {
    return this.fileRepository.find({
      where: { workspaceId },
      relations: ["uploader"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    return this.fileRepository.findOne({
      where: { id },
      relations: ["uploader", "workspace"],
    });
  }

  async remove(id: string) {
    const file = await this.findOne(id);
    if (file) {
      await this.minioService.deleteFile(file.minioPath);
      await this.fileRepository.delete(id);
    }
  }
}

