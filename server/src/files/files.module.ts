import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { MinIOService } from "./minio.service";
import { FileUpload } from "./entities/file-upload.entity";

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload]), ConfigModule],
  controllers: [FilesController],
  providers: [FilesService, MinIOService],
  exports: [FilesService, MinIOService],
})
export class FilesModule {}

