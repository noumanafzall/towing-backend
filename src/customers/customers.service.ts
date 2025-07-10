import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
    // Convert string IDs to numbers for comparison
    const customerId = Number(id);
    const authenticatedUserId = Number(userId);

    console.log('Service - Customer ID:', customerId);
    console.log('Service - Auth User ID:', authenticatedUserId);
    console.log('Service - Types:', { 
      customerIdType: typeof customerId,
      authUserIdType: typeof authenticatedUserId
    });

    // Verify the customer ID matches the authenticated user
    if (customerId !== authenticatedUserId) {
      console.log('Service - ID mismatch:', { customerId, authenticatedUserId });
      throw new UnauthorizedException('You can only update your own profile');
    }

    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
      include: {
        customerProfile: true
      }
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    if (customer.role !== 'CUSTOMER') {
      throw new UnauthorizedException('Only customers can update their profiles');
    }

    // Update user data
    const updateData: any = {};
    
    if (profileData.user) {
      // Only update allowed user fields
      const { fullName, phoneNumber, country, city } = profileData.user;
      Object.assign(updateData, {
        fullName,
        phoneNumber,
        country,
        city
      });
    }

    // Update customer profile data
    if (profileData.defaultAddress !== undefined) {
      updateData.customerProfile = {
        update: {
          defaultAddress: profileData.defaultAddress
        }
      };
    }

    // Update both user and customer profile
    return this.prisma.user.update({
      where: { id: customerId },
      data: updateData,
      include: {
        customerProfile: true
      }
    });
  }
}