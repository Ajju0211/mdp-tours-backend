import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get('r2.endpoint') || '',
      credentials: {
        accessKeyId: this.configService.get('r2.accessKeyId') || '',
        secretAccessKey: this.configService.get('r2.secretAccessKey') || '',
      },
    });

    this.bucket = this.configService.get('r2.bucket') || '';
    this.publicUrl = this.configService.get('r2.publicUrl') || '';
  }

  // ===============================
  // Upload Image(s) - AVIF only
  // ===============================
  async uploadImages(fileOrFiles: Express.Multer.File | Express.Multer.File[]) {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

    const results = await Promise.all(
      files.map(async (file) => {
        this.validateImage(file);

        const key = `images/${uuidv4()}.avif`;

        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: 'image/avif',
            CacheControl: 'public, max-age=31536000',
          }),
        );

        return {
          key,
          url: `${this.publicUrl}/${key}`,
          size: file.size,
        };
      }),
    );

    return Array.isArray(fileOrFiles) ? results : results[0];
  }

  // ===============================
  // Delete Image
  // ===============================
  async deleteImage(key: string) {
    if (!key || !key.startsWith('images/')) {
      throw new BadRequestException('Invalid image key');
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        message: 'Image deleted successfully',
        key,
      };
    } catch {
      throw new InternalServerErrorException('Deletion failed');
    }
  }

  // ===============================
  // Strict Validation
  // ===============================
  private validateImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.mimetype !== 'image/avif') {
      throw new BadRequestException('Only AVIF images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit for admin
    if (file.size > maxSize) {
      throw new BadRequestException('Image exceeds 5MB limit');
    }
  }
}
