import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateQueryDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  service?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsMongoId()
  packageId?: string;
}