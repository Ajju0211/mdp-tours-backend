import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DestinationType, PackageCategory } from 'src/enum/query.enum';
import { ImageItemDto } from './image-item.dto';

// 2. Nested DTO for Day Plans (to match dayPlanSchema)
class DayPlanDto {
  @IsNumber()
  @Min(1)
  dayNumber: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  activities: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images?: ImageItemDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionalActivities?: string[];

  @IsOptional()
  meals?: { breakfast?: string; lunch?: string; dinner?: string };

  @IsOptional()
  location?: { lat?: number; lng?: number };

  @IsOptional()
  @IsString()
  transport?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// 3. Main Package DTO
export class CreatePackageWithItineraryDto {
  @IsString()
  title: string;

  @IsString()
  destinationName: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageItemDto)
  coverImage?: ImageItemDto | null;

  @IsNumber()
  @Min(0)
  nights: number;

  @IsNumber()
  @Min(1)
  days: number;

  @IsNumber()
  @Min(0)
  pricePerPerson: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @IsArray()
  @IsEnum(PackageCategory, { each: true })
  category: PackageCategory[];

  @IsArray()
  @IsEnum(DestinationType, { each: true })
  type: DestinationType[];

  @IsNumber()
  @Min(1)
  minGroupSize: number;

  @IsNumber()
  @Min(1)
  maxGroupSize: number;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  isPublic: boolean;

  @IsArray()
  @IsString({ each: true })
  inclusions: string[];

  @IsArray()
  @IsString({ each: true })
  exclusions: string[];

  @IsArray()
  @IsString({ each: true })
  availableDates: string[]; // ISO strings

  @IsString()
  description: string;

  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayPlanDto)
  itineraryDays: DayPlanDto[];
}