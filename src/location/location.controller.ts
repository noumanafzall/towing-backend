import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post(':rideId')
  async updateLocation(
    @Param('rideId') rideId: string,
    @Body() locationData: {
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    }
  ) {
    return this.locationService.updateLocation(
      parseInt(rideId),
      locationData.latitude,
      locationData.longitude,
      locationData.speed,
      locationData.heading,
      locationData.accuracy
    );
  }

  @Get(':rideId/last')
  async getLastLocation(@Param('rideId') rideId: string) {
    return this.locationService.getLastLocation(parseInt(rideId));
  }

  @Get(':rideId/history')
  async getLocationHistory(@Param('rideId') rideId: string) {
    return this.locationService.getLocationHistory(parseInt(rideId));
  }
} 