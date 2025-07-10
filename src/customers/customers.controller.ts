import { Controller, Get, Put, Param, ParseIntPipe, UseGuards, Body, Req, UnauthorizedException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateCustomerProfileDto } from './dtos/update-customer-profile.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  async getAllCustomers() {
    return this.customersService.getAllCustomers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  async getCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.getCustomer(id);
  }

  @Put(':id/profile')
  @UseGuards(JwtAuthGuard)
  async updateCustomerProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileData: UpdateCustomerProfileDto,
    @Req() req
  ) {
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (Number(id) !== Number(req.user.userId)) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    return this.customersService.updateCustomerProfile(id, req.user.userId, profileData);
  }
}