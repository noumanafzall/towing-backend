import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';

@Controller('google-maps')
@UseGuards(JwtAuthGuard)
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  @Get('directions')
  async getDirections(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.googleMapsService.getDirections(origin, destination);
  }

  @Get('places/autocomplete')
  async getPlaces(@Query('query') query: string) {
    return this.googleMapsService.getPlaces(query);
  }

  @Get('places/details')
  async getPlaceDetails(@Query('placeId') placeId: string) {
    return this.googleMapsService.getPlaceDetails(placeId);
  }

  @Get('client-key')
  getClientKey() {
    return this.googleMapsService.getClientKey();
  }
} 