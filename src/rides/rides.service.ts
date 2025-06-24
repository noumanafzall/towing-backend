import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRideDto, RideStatus } from './dtos/create-ride.dto';

@Injectable()
export class RidesService {
  constructor(private prisma: PrismaService) {}

  async createRide(dto: CreateRideDto) {
    // Verify customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    // Check if this is a scheduled ride
    const pickupDate = new Date(dto.pickupDateTime);
    const isScheduled = pickupDate > new Date();

    // For scheduled rides, we don't require a driver immediately
    if (!isScheduled && !dto.driverId) {
      throw new BadRequestException('Driver ID is required for immediate rides');
    }

    // If driver ID is provided, verify driver exists
    if (dto.driverId) {
      const driver = await this.prisma.user.findUnique({
        where: { id: dto.driverId },
      });
      if (!driver) throw new NotFoundException('Driver not found');
    }

    // Create the ride
    const ride = await this.prisma.ride.create({
      data: {
        driverId: isScheduled ? null : dto.driverId,
        customerId: dto.customerId,
        pickupLocation: dto.pickupLocation,
        dropoffLocation: dto.dropoffLocation,
        pickupDateTime: pickupDate,
        expectedDropoff: dto.expectedDropoff ? new Date(dto.expectedDropoff) : null,
        estimatedDistance: dto.estimatedDistance,
        basePrice: dto.basePrice,
        totalPrice: dto.totalPrice,
        status: isScheduled ? RideStatus.SCHEDULED : RideStatus.PENDING,
        notes: dto.notes,
        vehicleId: dto.vehicleId,
        isScheduled,
        scheduledDate: isScheduled ? pickupDate : null
      },
      include: {
        driver: true,
        customer: true,
        vehicle: true
      }
    });

    return ride;
  }

  async acceptRide(rideId: number, driverId: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId && ride.driverId !== driverId) {
      throw new ForbiddenException('This ride has already been accepted by another driver');
    }

    if (ride.status !== RideStatus.PENDING && ride.status !== RideStatus.SCHEDULED) {
      throw new BadRequestException('This ride cannot be accepted');
    }

    // For scheduled rides, check if it's time to accept
    if (ride.isScheduled) {
      const now = new Date();
      const scheduledDate = new Date(ride.scheduledDate);
      
      // Allow accepting scheduled rides 24 hours before the scheduled time
      const acceptanceWindow = new Date(scheduledDate);
      acceptanceWindow.setHours(acceptanceWindow.getHours() - 24);
      
      if (now < acceptanceWindow) {
        throw new BadRequestException('Too early to accept this scheduled ride');
      }
    }

    return this.prisma.ride.update({
      where: { id: rideId },
      data: {
        driverId,
        status: RideStatus.ACCEPTED,
        driverAcceptedAt: new Date()
      },
      include: {
        driver: true,
        customer: true,
        vehicle: true
      }
    });
  }

  async getAvailableRides(skip = 0, take = 10, includeScheduled = false) {
    const now = new Date();
    const where = {
      OR: [
        // Immediate rides that are pending
        {
          status: RideStatus.PENDING,
          isScheduled: false
        },
        // Scheduled rides within the acceptance window (if includeScheduled is true)
        ...(includeScheduled ? [{
          status: RideStatus.SCHEDULED,
          isScheduled: true,
          scheduledDate: {
            lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next 24 hours
          }
        }] : [])
      ],
      driverId: null
    };

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take,
        orderBy: [
          { isScheduled: 'asc' },
          { scheduledDate: 'asc' },
          { createdAt: 'asc' }
        ],
        include: {
          customer: true,
          vehicle: true
        }
      }),
      this.prisma.ride.count({ where })
    ]);

    return { rides, total };
  }

  async associateVehicle(rideId: number, customerId: number, vehicleId: number, beforeRidePhotos?: string[], afterRidePhotos?: string[]) {
    // Verify ride exists and belongs to customer
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: { vehicle: true }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to modify this ride');
    }

    // Verify vehicle exists and belongs to customer
    const vehicle = await this.prisma.customerVehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to use this vehicle');
    }

    // Update vehicle photos if provided
    if (beforeRidePhotos || afterRidePhotos) {
      await this.prisma.customerVehicle.update({
        where: { id: vehicleId },
        data: {
          beforeRidePhotos: beforeRidePhotos || vehicle.beforeRidePhotos,
          afterRidePhotos: afterRidePhotos || vehicle.afterRidePhotos
        }
      });
    }

    // Associate vehicle with ride
    return this.prisma.ride.update({
      where: { id: rideId },
      data: { vehicleId },
      include: {
        driver: true,
        customer: true,
        vehicle: true
      }
    });
  }

  async getRide(id: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        driver: true,
        customer: true,
        vehicle: true,
        lastLocation: true,
        locationUpdates: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  async updateRideStatus(id: number, status: RideStatus, cancellationReason?: string) {
    const ride = await this.prisma.ride.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === RideStatus.CANCELLED ? cancellationReason : null,
        dropoffDateTime: status === RideStatus.COMPLETED ? new Date() : undefined
      }
    });

    return ride;
  }

  async getRides(skip = 0, take = 10, status?: RideStatus) {
    const where = status ? { status } : {};
    
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: true,
          customer: true,
          vehicle: true,
          lastLocation: true
        }
      }),
      this.prisma.ride.count({ where })
    ]);

    return { rides, total };
  }
}