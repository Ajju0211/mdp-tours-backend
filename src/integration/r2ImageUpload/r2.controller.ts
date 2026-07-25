// src/upload/upload.controller.ts

import {
  Controller,
  Post,
  Delete,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './r2.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Image Uploads')
@Controller('admin/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Uploads one or multiple images to the storage bucket.
   * Limits files to AVIF format with a maximum size of 5MB per file.
   * 
   * @param files - Array of image files uploaded via multipart/form-data
   * @throws BaseException if no files are provided or validation fails
   * @returns Array of uploaded file URLs and metadata
   */
  @Post('images')
  @ApiOperation({ summary: 'Upload images (AVIF only, max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
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

  /**
   * Deletes an image from the storage bucket using its unique object key.
   * 
   * @param key - The S3/R2 object key identifying the file to delete
   * @throws BaseException if the key is not provided
   * @returns Success confirmation
   */
  @Delete('image')
  @ApiOperation({ summary: 'Delete an image by key' })
  @ApiBody({ schema: { properties: { key: { type: 'string' } } } })
  async deleteImage(@Body('key') key: string) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    return this.uploadService.deleteImage(key);
  }
}
