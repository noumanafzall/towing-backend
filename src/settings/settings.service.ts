import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingSettingDto } from './dtos/pricing-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPricingSettings() {
    const settings = await this.prisma.pricingSetting.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    return settings || {
      basePrice: 50.00,
      baseMiles: 5.0,
      pricePerMile: 2.50
    };
  }

  async updatePricingSettings(data: PricingSettingDto) {
    return this.prisma.pricingSetting.create({
      data: {
        basePrice: data.basePrice,
        baseMiles: data.baseMiles,
        pricePerMile: data.pricePerMile
      }
    });
  }

  async calculateRidePrice(distance: number) {
    const settings = await this.getPricingSettings();
    const extraMiles = Math.max(0, distance - settings.baseMiles);
    const extraCost = extraMiles * settings.pricePerMile;
    const totalPrice = settings.basePrice + extraCost;

    return {
      basePrice: settings.basePrice,
      extraMiles,
      extraCost,
      totalPrice,
    };
  }
} 