import { Injectable } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base.exception';
import { ERROR_CODES } from '../../common/exceptions/error-codes.enum';
import { FileTooLargeException, InvalidFileTypeException, StorageOperationFailedException, UploadFailedException } from './exceptions/upload.exception';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IdUtil } from '../../common/utils/id.util';
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

  /**
   * Uploads one or multiple images to Cloudflare R2 / AWS S3.
   * 
   * @param fileOrFiles - Single or array of Multer file objects
   * @returns Metadata of the uploaded image(s) including URL and Key
   */
  async uploadImages(fileOrFiles: Express.Multer.File | Express.Multer.File[]) {
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];

    const results = await Promise.all(
      files.map(async (file) => {
        this.validateImage(file);

        const key = `images/${IdUtil.generateUuid()}.avif`;

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

  /**
   * Permanently deletes an image from the storage bucket.
   * 
   * @param key - The unique object key of the image
   * @throws StorageOperationFailedException or InvalidFileTypeException if key is invalid or deletion fails
   * @returns Success confirmation message
   */
  async deleteImage(key: string) {
    if (!key || !key.startsWith('images/')) {
      throw new InvalidFileTypeException('Invalid image key');
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
      throw new StorageOperationFailedException('Deletion failed');
    }
  }

  /**
   * Validates an uploaded image for correct mimetype and size constraints.
   * 
   * @param file - The Multer file object to validate
   * @throws InvalidFileTypeException or FileTooLargeException if file is missing, not AVIF, or exceeds size limits
   */
  private validateImage(file: Express.Multer.File) {
    if (!file) {
      throw new InvalidFileTypeException('File is required');
    }

    if (file.mimetype !== 'image/avif') {
      throw new InvalidFileTypeException('Only AVIF images are allowed');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB limit for admin
    if (file.size > maxSize) {
      throw new FileTooLargeException('Image exceeds 5MB limit');
    }
  }
}
