import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, ArrayMinSize, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum RideStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RideRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
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

export class CreateRideRequestDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleDetailsDto)
  @ArrayMinSize(1)
  vehicles: VehicleDetailsDto[];

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

  @IsBoolean()
  @IsOptional()
  isScheduled?: boolean = false;
}

export class CreateRideDto extends CreateRideRequestDto {
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsNumber()
  @IsNotEmpty()
  driverId: number;

  @IsNumber()
  @IsNotEmpty()
  rideRequestId: number;
}