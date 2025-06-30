import { IsString, IsEmail, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

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

export class UpdateCustomerProfileDto {
  @IsOptional()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @IsString()
  @IsOptional()
  defaultAddress?: string;

  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean;

  @IsNumber()
  @IsOptional()
  totalOrders?: number;

  @IsNumber()
  @IsOptional()
  totalAmountSpent?: number;
} 