// src/upload/upload.module.ts

import { Module } from '@nestjs/common';
import { UploadController } from './r2.controller';
import { UploadService } from './r2.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
