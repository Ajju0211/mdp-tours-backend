// create-package-with-itinerary.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImageItemDto } from './image-item.dto';
import { PackageCategory } from 'src/enum/query.enum';

class DayPlanDto {
  @IsNumber() dayNumber: number;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsArray() @IsString({ each: true }) activities: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images?: ImageItemDto[];

  @IsArray()
  @IsEnum(PackageCategory, { each: true })
  categories: PackageCategory[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionalActivities?: string[];

  @IsOptional() @IsString() transport?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) videos?: string[];
  @IsOptional() @IsString() notes?: string;
  @IsOptional()
  meals?: { breakfast?: string; lunch?: string; dinner?: string };
  @IsOptional()
  location?: { lat?: number; lng?: number };
}

export class CreatePackageWithItineraryDto {
  @IsString() title: string;
  @IsString() destinationName: string;
  @IsNumber() nights: number;
  @IsNumber() days: number;
  @IsNumber() pricePerPerson: number;
  @IsNumber() discountPercent: number;
  @ValidateNested() @Type(() => ImageItemDto) coverImage: ImageItemDto;
  @IsBoolean() isActive: boolean;
  @IsBoolean() isPublic: boolean;
  @IsArray() @IsString({ each: true }) inclusions: string[];
  @IsArray() @IsString({ each: true }) exclusions: string[];
  @IsArray() @IsString({ each: true }) availableDates: string[]; // ISO strings
  @IsString() description: string;
  @IsString() metaTitle: string;
  @IsString() metaDescription: string;

  @IsArray() @Type(() => DayPlanDto) itineraryDays: DayPlanDto[];
}
