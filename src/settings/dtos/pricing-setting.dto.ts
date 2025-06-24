import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class PricingSettingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  baseMiles: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  pricePerMile: number;
} 