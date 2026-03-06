// image-item.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class ImageItemDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
