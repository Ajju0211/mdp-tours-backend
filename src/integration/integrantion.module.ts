import { Module } from '@nestjs/common';
import { UploadModule } from './r2ImageUpload/r2.module';

@Module({
  imports: [UploadModule],
  controllers: [],
  providers: [],
})
export class IntegrationModule {}
