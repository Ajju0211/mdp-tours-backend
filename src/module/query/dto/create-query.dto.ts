import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateQueryDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  service: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  message: string;
}