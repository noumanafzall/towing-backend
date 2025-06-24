import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Request, ParseIntPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CustomerVehicleDto } from '../rides/dtos/customer-vehicle.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'LIMITED_ADMIN')
  getAllCustomers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.customersService.getAllCustomers(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
    );
  }

  @Get('count')
  @Roles('SUPER_ADMIN', 'LIMITED_ADMIN')
  async getCustomerCount() {
    return { count: await this.customersService.getCustomerCount() };
  }

  @Get('vehicles')
  @UseGuards(JwtAuthGuard)
  async getCustomerVehicles(@Request() req) {
    return this.customersService.getCustomerVehicles(req.user.id);
  }

  @Get('vehicles/:id')
  @UseGuards(JwtAuthGuard)
  async getCustomerVehicle(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.customersService.getCustomerVehicle(id, req.user.id);
  }

  @Post('vehicles')
  @UseGuards(JwtAuthGuard)
  async createCustomerVehicle(@Body() vehicleDto: CustomerVehicleDto, @Request() req) {
    return this.customersService.createCustomerVehicle(req.user.id, vehicleDto);
  }

  @Put('vehicles/:id')
  @UseGuards(JwtAuthGuard)
  async updateCustomerVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() vehicleDto: CustomerVehicleDto,
    @Request() req
  ) {
    return this.customersService.updateCustomerVehicle(id, req.user.id, vehicleDto);
  }

  @Delete('vehicles/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCustomerVehicle(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.customersService.deleteCustomerVehicle(id, req.user.id);
  }
}