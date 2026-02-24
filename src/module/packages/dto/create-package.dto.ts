import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  destinationName: string;

  @IsNumber()
  nights: number;

  @IsNumber()
  days: number;

  @IsNumber()
  pricePerPerson: number;

  @IsString()
  coverImage: string;
}