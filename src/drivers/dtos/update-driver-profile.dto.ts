import { IsString, IsEmail, IsOptional, IsArray, IsBoolean, IsInt, Min, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RegistrationStatus } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  profilePic?: string;
}

export class UpdateDriverProfileDto {
  @IsOptional()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @IsString()
  @IsOptional()
  licenseUrl?: string;

  @IsString()
  @IsOptional()
  insuranceUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  vehiclePhotos?: string[];

  @IsString()
  @IsOptional()
  truckType?: string;

  @IsString()
  @IsOptional()
  truckCapacity?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  truckPhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean;

  @IsNumber()
  @IsOptional()
  ratings?: number;

  @IsString()
  @IsOptional()
  billingType?: string;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  registrationStatus?: RegistrationStatus;

  @IsInt()
  @Min(0)
  @IsOptional()
  experience?: number;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsString()
  @IsOptional()
  swiftCode?: string;
} 