import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class RefundRequestDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsNumber()
  @IsNotEmpty()
  rideId: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidencePhotos?: string[];
} 