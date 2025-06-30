import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, ParseIntPipe, Request, BadRequestException, ForbiddenException } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto, RideStatus } from './dtos/create-ride.dto';
import { UpdateVehiclePhotosDto } from './dtos/update-vehicle-photos.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('rides')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @Roles('DRIVER')
  async createRide(@Body() createRideDto: CreateRideDto) {
    return this.ridesService.createRide(createRideDto);
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
  @Roles('DRIVER')
  async getRide(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.ridesService.getRide(id, req.user.id);
  }

  @Get()
  @Roles('DRIVER')
  async getRides(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: RideStatus
  ) {
    return this.ridesService.getRides(
      req.user.id,
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      status
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