import { Controller, Get, Post, Put, Body, Param, UseGuards, Query, ParseIntPipe, Request } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto, RideStatus } from './dtos/create-ride.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRide(@Body() createRideDto: CreateRideDto) {
    return this.ridesService.createRide(createRideDto);
  }

  @Post(':id/vehicle')
  @UseGuards(JwtAuthGuard)
  async associateVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { vehicleId: number; beforeRidePhotos?: string[]; afterRidePhotos?: string[] },
    @Request() req
  ) {
    return this.ridesService.associateVehicle(
      id,
      req.user.id,
      data.vehicleId,
      data.beforeRidePhotos,
      data.afterRidePhotos
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRide(@Param('id', ParseIntPipe) id: number) {
    return this.ridesService.getRide(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getRides(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: RideStatus
  ) {
    return this.ridesService.getRides(
      skip ? parseInt(skip) : undefined,
      take ? parseInt(take) : undefined,
      status
    );
  }

  @Put(':id/status')
  async updateRideStatus(
    @Param('id') id: string,
    @Body() data: { status: RideStatus; cancellationReason?: string }
  ) {
    return this.ridesService.updateRideStatus(
      parseInt(id),
      data.status,
      data.cancellationReason
    );
  }
}