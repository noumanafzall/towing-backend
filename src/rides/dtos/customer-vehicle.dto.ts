import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CustomerVehicleDto {
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  beforeRidePhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  afterRidePhotos?: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 