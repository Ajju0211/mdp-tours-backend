import {
    IsOptional,
    IsNumber,
    IsString,
    Min,
    IsEnum,
    IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PackageCategory, DestinationType } from 'src/enum/query.enum';

export class GetPackagesFilterDto {

    @IsOptional()
    @IsString()
    q?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsString()
    groupSize?: string;

    @IsOptional()
    @IsEnum(PackageCategory)
    category?: PackageCategory;

    @IsOptional()
    @IsEnum(DestinationType)
    type?: DestinationType;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number;

    // cursor for infinite scroll
    @IsOptional()
    @IsMongoId()
    cursor?: string;
}