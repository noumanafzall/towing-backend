import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async updateLocation(rideId: number, lat: number, lng: number, speed?: number, heading?: number, accuracy?: number) {
    // First, set all previous location updates for this ride to not be the last known
    await this.prisma.locationUpdate.updateMany({
      where: { rideId, isLastKnown: true },
      data: { isLastKnown: false }
    });

    // Create new location update
    const locationUpdate = await this.prisma.locationUpdate.create({
      data: {
        rideId,
        latitude: lat,
        longitude: lng,
        speed,
        heading,
        accuracy,
        isLastKnown: true
      }
    });

    // Update the ride's last location
    await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        lastLocationId: locationUpdate.id
      }
    });

    return locationUpdate;
  }

  async getLastLocation(rideId: number) {
    return this.prisma.locationUpdate.findFirst({
      where: { rideId, isLastKnown: true },
      orderBy: { timestamp: 'desc' }
    });
  }

  async getLocationHistory(rideId: number) {
    return this.prisma.locationUpdate.findMany({
      where: { rideId },
      orderBy: { timestamp: 'desc' }
    });
  }
} 