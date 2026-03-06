// src/upload/upload.controller.ts

import {
  Controller,
  Post,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './r2.service';

@Controller('admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // ===============================
  // Upload (Single or Multiple)
  // ===============================
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.uploadService.uploadImages(files);
  }

  // ===============================
  // Delete
  // ===============================
  @Delete('image')
  async deleteImage(@Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    return this.uploadService.deleteImage(key);
  }
}
