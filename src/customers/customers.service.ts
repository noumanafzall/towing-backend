import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomerVehicleDto } from '../rides/dtos/customer-vehicle.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getAllCustomers(skip = 0, take = 10) {
    try {
      const [customers, total] = await Promise.all([
        this.prisma.user.findMany({
          where: { role: 'CUSTOMER' },
          skip,
          take,
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePic: true,
            role: true,
            country: true,
            city: true,
            customerProfile: {
              select: {
                totalOrders: true,
                totalAmountSpent: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.user.count({
          where: { role: 'CUSTOMER' },
        }),
      ]);

      return {
        data: customers,
        meta: {
          total,
          skip,
          take,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }

  async getCustomerCount() {
    try {
      return this.prisma.user.count({
        where: { role: 'CUSTOMER' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get customer count');
    }
  }

  async getCustomerVehicles(userId: number) {
    return this.prisma.customerVehicle.findMany({
      where: { customerId: userId }
    });
  }

  async getCustomerVehicle(id: number, userId: number) {
    const vehicle = await this.prisma.customerVehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to access this vehicle');
    }

    return vehicle;
  }

  async createCustomerVehicle(userId: number, vehicleDto: CustomerVehicleDto) {
    // If this is set as default, unset any existing default
    if (vehicleDto.isDefault) {
      await this.prisma.customerVehicle.updateMany({
        where: { customerId: userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    return this.prisma.customerVehicle.create({
      data: {
        customerId: userId,
        plateNumber: vehicleDto.plateNumber,
        vehicleType: vehicleDto.vehicleType,
        color: vehicleDto.color,
        photos: vehicleDto.photos || [],
        beforeRidePhotos: vehicleDto.beforeRidePhotos || [],
        afterRidePhotos: vehicleDto.afterRidePhotos || [],
        isDefault: vehicleDto.isDefault || false
      }
    });
  }

  async updateCustomerVehicle(id: number, userId: number, vehicleDto: CustomerVehicleDto) {
    const vehicle = await this.getCustomerVehicle(id, userId);

    // If this is set as default, unset any existing default
    if (vehicleDto.isDefault) {
      await this.prisma.customerVehicle.updateMany({
        where: { 
          customerId: userId, 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    return this.prisma.customerVehicle.update({
      where: { id },
      data: {
        plateNumber: vehicleDto.plateNumber,
        vehicleType: vehicleDto.vehicleType,
        color: vehicleDto.color,
        photos: vehicleDto.photos || vehicle.photos,
        beforeRidePhotos: vehicleDto.beforeRidePhotos || vehicle.beforeRidePhotos,
        afterRidePhotos: vehicleDto.afterRidePhotos || vehicle.afterRidePhotos,
        isDefault: vehicleDto.isDefault
      }
    });
  }

  async deleteCustomerVehicle(id: number, userId: number) {
    // Check if vehicle exists and belongs to user
    await this.getCustomerVehicle(id, userId);

    // Check if vehicle is associated with any rides
    const associatedRides = await this.prisma.ride.count({
      where: { vehicleId: id }
    });

    if (associatedRides > 0) {
      throw new ForbiddenException('Cannot delete vehicle that has associated rides');
    }

    return this.prisma.customerVehicle.delete({
      where: { id }
    });
  }
}