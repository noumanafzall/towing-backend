import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PricingSettingDto } from './dtos/pricing-setting.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('pricing')
  async getPricingSettings() {
    return this.settingsService.getPricingSettings();
  }

  @Put('pricing')
  @Roles(Role.SUPER_ADMIN)
  async updatePricingSettings(@Body() data: PricingSettingDto) {
    return this.settingsService.updatePricingSettings(data);
  }
} 