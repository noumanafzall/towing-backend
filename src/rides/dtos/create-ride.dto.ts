import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class VehicleDetailsDto {
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  vehicleModel: string;

  @IsString()
  @IsNotEmpty()
  vehicleColor: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  beforeRidePhotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  afterRidePhotos?: string[];
}

export class CreateRideDto {
  @IsNumber()
  @IsOptional()
  driverId?: number;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDetailsDto)
  @ArrayMinSize(1)
  vehicles: VehicleDetailsDto[];

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsDateString()
  @IsNotEmpty()
  pickupDateTime: string;

  @IsDateString()
  @IsOptional()
  expectedDropoff?: string;

  @IsNumber()
  @IsOptional()
  estimatedDistance?: number;

  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @IsOptional()
  totalPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}