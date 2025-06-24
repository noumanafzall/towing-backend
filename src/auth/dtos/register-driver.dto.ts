import { IsString, IsEmail, IsNotEmpty, MinLength, IsArray, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RegisterDriverDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;

  @IsString()
  @IsOptional()
  licenseUrl?: string;

  @IsString()
  @IsOptional()
  insuranceUrl?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  vehiclePhotos?: string[];

  @IsString()
  @IsOptional()
  truckType?: string;

  @IsString()
  @IsOptional()
  truckCapacity?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  truckPhotos?: string[];

  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',');
      }
    }
    return value;
  })
  languages?: string[];

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === '1') return true;
    if (value === '0') return false;
    return value;
  })
  termsAccepted: boolean;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  experience?: number;
}