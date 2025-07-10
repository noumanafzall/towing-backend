import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, ParseIntPipe, Request, BadRequestException, ForbiddenException } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto, RideStatus, CreateRideRequestDto, RideRequestStatus } from './dtos/create-ride.dto';
import { UpdateVehiclePhotosDto } from './dtos/update-vehicle-photos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request as ExpressRequest } from 'express';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: number;
    role: string;
  };
}

@Controller('rides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @Roles('CUSTOMER')
  async createRide(@Body() createRideDto: CreateRideDto, @Request() req: RequestWithUser) {
    console.log('Create ride request from user:', {
      userId: req.user.userId,
      role: req.user.role,
      endpoint: 'createRide'
    });
    console.log('Request body:', JSON.stringify(createRideDto, null, 2));

    // If customer is creating the ride, use their ID
    if (req.user.role === 'CUSTOMER') {
      console.log('Setting customerId from authenticated user:', req.user.userId);
      createRideDto.customerId = req.user.userId;
    }

    try {
      const result = await this.ridesService.createRide(createRideDto);
      console.log('Ride created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating ride:', {
        error: error.message,
        stack: error.stack,
        response: error.response,
        constraints: error.constraints,
        validation: error.errors
      });
      throw error;
    }
  }

  @Post('request')
  @Roles('CUSTOMER')
  async createRideRequest(@Body() createRideRequestDto: CreateRideRequestDto, @Request() req: RequestWithUser) {
    console.log('Create ride request from user:', {
      userId: req.user.userId,
      role: req.user.role,
      endpoint: 'createRideRequest'
    });
    console.log('Request body:', JSON.stringify(createRideRequestDto, null, 2));

    try {
      const result = await this.ridesService.createRide({
        ...createRideRequestDto,
        customerId: req.user.userId,
        driverId: null,
        rideRequestId: null
      });
      console.log('Ride request created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating ride request:', {
        error: error.message,
        stack: error.stack,
        response: error.response,
        constraints: error.constraints,
        validation: error.errors
      });
      throw error;
    }
  }

  @Get('requests/available')
  @Roles('DRIVER')
  async getAvailableRideRequests(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('includeScheduled') includeScheduled?: string
  ) {
    return this.ridesService.getAvailableRides(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      includeScheduled === 'true'
    );
  }

  @Post('request/:id/accept')
  @Roles('DRIVER')
  async acceptRideRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Request() req: RequestWithUser
  ) {
    return this.ridesService.acceptRide(requestId, req.user.userId);
  }

  @Put(':id/vehicle-photos')
  @Roles('DRIVER')
  async updateAfterRidePhotos(
    @Param('id', ParseIntPipe) rideId: number,
    @Body() updatePhotosDto: UpdateVehiclePhotosDto,
    @Request() req
  ) {
    return this.ridesService.updateAfterRidePhotos(rideId, updatePhotosDto.vehicleId, updatePhotosDto.afterRidePhotos, req.user.id);
  }

  @Get(':id')
  @Roles('DRIVER', 'CUSTOMER')
  async getRide(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.ridesService.getRide(id, req.user.userId, req.user.role);
  }

  @Get()
  @Roles('DRIVER', 'CUSTOMER')
  async getRides(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: RideStatus
  ) {
    return this.ridesService.getRides(
      req.user.userId,
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      status,
      req.user.role
    );
  }

  @Put(':id/status')
  @Roles('DRIVER')
  async updateRideStatus(
    @Param('id') id: string,
    @Body() data: { status: RideStatus; cancellationReason?: string },
    @Request() req
  ) {
    return this.ridesService.updateRideStatus(
      parseInt(id),
      data.status,
      req.user.id,
      data.cancellationReason
    );
  }

  @Get('driver/:driverId/earnings')
  @Roles('DRIVER', 'ADMIN', 'MODERATOR')
  async getDriverEarnings(
    @Request() req,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (req.user.role === 'DRIVER' && req.user.id !== driverId) {
      throw new ForbiddenException('You can only view your own earnings');
    }

    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate && endDate) {
      parsedStartDate = new Date(startDate);
      parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    return this.ridesService.getDriverEarnings(
      driverId,
      parsedStartDate,
      parsedEndDate
    );
  }

  @Get('drivers/earnings')
  @Roles('ADMIN')
  async getAllDriversEarnings(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate && endDate) {
      parsedStartDate = new Date(startDate);
      parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
    }

    return this.ridesService.getAllDriversEarnings(parsedStartDate, parsedEndDate);
  }
}