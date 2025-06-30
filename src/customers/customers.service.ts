import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerProfileDto } from './dtos/update-customer-profile.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getAllCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        customerProfile: true
      }
    });
  }

  async getCustomer(id: number) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: true
      }
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async updateCustomerProfile(id: number, userId: number, profileData: UpdateCustomerProfileDto) {
    // Verify the customer ID matches the authenticated user
    if (id !== userId) {
      throw new BadRequestException('You can only update your own profile');
    }

    const customer = await this.prisma.user.findUnique({
      where: { id },
      include: {
        customerProfile: true
      }
    });

    if (!customer || customer.role !== 'CUSTOMER') {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Separate user data and customer profile data
    const { user: userData, ...customerProfileData } = profileData;

    // Update both user and customer profile
    return this.prisma.user.update({
      where: { id },
      data: {
        ...userData,
        customerProfile: {
          update: {
            ...customerProfileData
          }
        }
      },
      include: {
        customerProfile: true
      }
    });
  }
}