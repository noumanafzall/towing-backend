import { IsArray, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateVehiclePhotosDto {
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  afterRidePhotos: string[];
} 