// image-item.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ImageItemDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}
