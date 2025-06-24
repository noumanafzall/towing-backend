import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';

export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class CreateRideDto {
  @IsNumber()
  @IsOptional()
  driverId?: number;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

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

  @IsArray()
  @IsOptional()
  beforeRidePhotos?: string[];

  @IsArray()
  @IsOptional()
  afterRidePhotos?: string[];
}