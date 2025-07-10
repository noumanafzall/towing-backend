import { Controller, Get, Put, Body, Post, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { PricingSettingDto } from './dtos/pricing-setting.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('pricing')
  async getPricingSettings() {
    return this.settingsService.getPricingSettings();
  }

  @Put('pricing')
  @Roles(Role.ADMIN)
  async updatePricingSettings(@Body() data: PricingSettingDto) {
    return this.settingsService.updatePricingSettings(data);
  }
} 