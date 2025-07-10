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

    // Validate pickup time for scheduled rides only
    const pickupDate = new Date(dto.pickupDateTime);
    const now = new Date();
    
    if (dto.isScheduled) {
      // For scheduled rides, pickup time must be in the future
      if (pickupDate <= now) {
        throw new BadRequestException('Scheduled rides must have a future pickup time');
      }
    }

    // If driver ID is provided (e.g., by admin), verify driver exists
    if (dto.driverId) {
      const driver = await this.prisma.user.findUnique({
        where: { id: dto.driverId },
      });
      if (!driver) throw new NotFoundException('Driver not found');
    }

    try {
      // Create the ride with vehicles
      const ride = await this.prisma.ride.create({
        data: {
          driverId: dto.driverId || null, // Allow null driver ID for new rides
          customerId: dto.customerId,
          pickupLocation: dto.pickupLocation,
          dropoffLocation: dto.dropoffLocation,
          pickupDateTime: pickupDate,
          expectedDropoff: dto.expectedDropoff ? new Date(dto.expectedDropoff) : null,
          estimatedDistance: dto.estimatedDistance,
          basePrice: dto.basePrice,
          totalPrice: dto.totalPrice,
          status: dto.isScheduled ? RideStatus.SCHEDULED : RideStatus.PENDING,
          notes: dto.notes,
          isScheduled: dto.isScheduled || false,
          scheduledDate: dto.isScheduled ? pickupDate : null,
          vehicles: {
            create: dto.vehicles.map(vehicle => ({
              plateNumber: vehicle.plateNumber,
              vehicleType: vehicle.vehicleType,
              vehicleModel: vehicle.vehicleModel,
              vehicleColor: vehicle.vehicleColor,
              description: vehicle.description,
              beforeRidePhotos: vehicle.beforeRidePhotos || [],
              afterRidePhotos: vehicle.afterRidePhotos || []
            }))
          }
        },
        include: {
          driver: true,
          customer: true,
          vehicles: true
        }
      });

      return ride;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('A ride with these details already exists');
      }
      throw error;
    }
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
      
      // Allow accepting scheduled rides 1 hour before the scheduled time
      const acceptanceWindow = new Date(scheduledDate);
      acceptanceWindow.setHours(acceptanceWindow.getHours() - 1);
      
      if (now < acceptanceWindow) {
        throw new BadRequestException('Too early to accept this scheduled ride. Scheduled rides can be accepted 1 hour before pickup time.');
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
        vehicles: true
      }
    });
  }

  async getAvailableRides(skip = 0, take = 10, includeScheduled = false) {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour window

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
            gte: now,
            lte: oneHourFromNow
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
          vehicles: true
        }
      }),
      this.prisma.ride.count({ where })
    ]);

    return { rides, total };
  }

  async getRide(id: number, userId: number, role?: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        driver: true,
        customer: true,
        vehicles: true
      }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // For customers, they can only view their own rides
    if (role === 'CUSTOMER' && ride.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this ride');
    }

    // For drivers, they can only view their assigned rides or rides with no driver
    if (role === 'DRIVER' && ride.driverId !== userId && ride.driverId !== null) {
      throw new ForbiddenException('You do not have permission to view this ride');
    }

    return ride;
  }

  async updateRideStatus(id: number, status: RideStatus, userId: number, cancellationReason?: string) {
    const ride = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        vehicles: true,
        driverEarning: true
      }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    // Check if user is either the driver or customer of this ride
    if (ride.customerId !== userId && ride.driverId !== userId) {
      throw new ForbiddenException('You do not have permission to update this ride');
    }

    // If trying to complete the ride, check for after-ride photos
    if (status === RideStatus.COMPLETED) {
      // Check if all vehicles have after-ride photos
      const missingPhotos = ride.vehicles.some(vehicle => !vehicle.afterRidePhotos?.length);
      if (missingPhotos) {
        throw new BadRequestException('Cannot complete ride: After-ride photos are required for all vehicles');
      }

      // Calculate and create driver earnings if not already created
      if (!ride.driverEarning && ride.driverId) {
        await this.createDriverEarning(ride.id);
      }
    }

    return this.prisma.ride.update({
      where: { id },
      data: {
        status,
        cancellationReason: status === RideStatus.CANCELLED ? cancellationReason : null
      },
      include: {
        vehicles: true,
        driver: true,
        customer: true,
        driverEarning: true
      }
    });
  }

  // New method to create driver earnings
  private async createDriverEarning(rideId: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: true
      }
    });

    if (!ride || !ride.driverId || !ride.totalPrice) {
      throw new BadRequestException('Invalid ride data for earnings calculation');
    }

    // Get platform fee percentage from settings
    const platformFeePercentage = 0.20; // 20% platform fee - you might want to make this configurable
    const platformFee = ride.totalPrice * platformFeePercentage;
    const driverAmount = ride.totalPrice - platformFee;

    // Calculate tax if applicable (you might want to add tax calculation logic based on driver's tax profile)
    const taxAmount = 0; // Placeholder for tax calculation

    // Create driver earning record
    return this.prisma.driverEarning.create({
      data: {
        rideId: ride.id,
        driverId: ride.driverId,
        amount: driverAmount,
        platformFee,
        taxAmount,
        netAmount: driverAmount - taxAmount,
      }
    });
  }

  // New method to get driver earnings
  async getDriverEarnings(driverId: number, startDate?: Date, endDate?: Date) {
    const where = {
      driverId,
      ...(startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      } : {})
    };

    const [earnings, totalEarnings] = await Promise.all([
      this.prisma.driverEarning.findMany({
        where,
        include: {
          ride: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.driverEarning.aggregate({
        where,
        _sum: {
          netAmount: true
        }
      })
    ]);

    return {
      earnings,
      totalEarnings: totalEarnings._sum.netAmount || 0
    };
  }

  async getRides(userId: number, skip?: number, take?: number, status?: RideStatus, role?: string) {
    let where: any = {};

    // For customers, only show their rides
    if (role === 'CUSTOMER') {
      where = {
        customerId: userId,
        ...(status ? { status } : {})
      };
    }
    // For drivers, show their assigned rides
    else if (role === 'DRIVER') {
      where = {
        driverId: userId,
        ...(status ? { status } : {})
      };
    }
    // For admin/other roles, show all rides they're involved in
    else {
      where = {
        OR: [
          { customerId: userId },
          { driverId: userId }
        ],
        ...(status ? { status } : {})
      };
    }
    
    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where,
        skip,
        take,
        include: {
          driver: true,
          customer: true,
          vehicles: true
        },
        orderBy: [
          { isScheduled: 'desc' },
          { scheduledDate: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      this.prisma.ride.count({ where })
    ]);

    return {
      rides,
      total,
      skip: skip || 0,
      take: take || 10
    };
  }

  async updateAfterRidePhotos(rideId: number, vehicleId: number, afterRidePhotos: string[], driverId: number) {
    // First check if the ride exists and the driver is assigned to it
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        vehicles: true
      }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    if (ride.driverId !== driverId) {
      throw new ForbiddenException('You are not authorized to update this ride');
    }

    // Find the specific vehicle in the ride
    const vehicle = ride.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found in this ride');
    }

    // Update the vehicle's after-ride photos
    const updatedVehicle = await this.prisma.rideVehicle.update({
      where: { id: vehicleId },
      data: {
        afterRidePhotos
      }
    });

    return updatedVehicle;
  }

  // New method to get all drivers' earnings
  async getAllDriversEarnings(startDate?: Date, endDate?: Date) {
    const where = {
      ...(startDate && endDate ? {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      } : {})
    };

    const [earnings, totalEarnings] = await Promise.all([
      this.prisma.driverEarning.findMany({
        where,
        include: {
          ride: true,
          driver: {
            select: {
              id: true,
              fullName: true,
              email: true,
              driverProfile: true
            }
          }
        },
        orderBy: [
          {
            driver: {
              fullName: 'asc'
            }
          },
          {
            createdAt: 'desc'
          }
        ]
      }),
      this.prisma.driverEarning.aggregate({
        where,
        _sum: {
          netAmount: true
        }
      })
    ]);

    // Group earnings by driver
    const driverEarnings = earnings.reduce((acc, earning) => {
      const driverId = earning.driverId;
      if (!acc[driverId]) {
        acc[driverId] = {
          driver: earning.driver,
          earnings: [],
          totalEarnings: 0
        };
      }
      acc[driverId].earnings.push(earning);
      acc[driverId].totalEarnings += earning.netAmount;
      return acc;
    }, {});

    return {
      driversEarnings: Object.values(driverEarnings),
      totalSystemEarnings: totalEarnings._sum.netAmount || 0
    };
  }
}