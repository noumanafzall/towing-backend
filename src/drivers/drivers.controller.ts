import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, BadRequestException, UseInterceptors, UploadedFiles, Patch } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DriversService } from './drivers.service';
import { RegistrationStatus } from '@prisma/client';
import { UpdateDriverProfileDto } from './dtos/update-driver-profile.dto';
import * as multer from 'multer';
import * as path from 'path';

// Configure multer storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

interface DriverData {
  fullName: string;
  email: string;
  country: string;
  city?: string;
  languages?: string;
  termsAccepted: string | boolean;
  billingType?: string;
  registrationStatus: RegistrationStatus;
  taxInfo?: {
    legalName: string;
    ssnOrEin: string;
    mailingAddress: string;
    consent1099: boolean;
  };
}

interface UploadedFiles {
  profilePic?: Express.Multer.File[];
  licenseUrl?: Express.Multer.File[];
  insuranceUrl?: Express.Multer.File[];
  vehiclePhotos?: Express.Multer.File[];
  truckPhotos?: Express.Multer.File[];
}

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('count')
  async getDriverCount() {
    return this.driversService.getDriverCount();
  }

  @Post()
  async createDriver(@Body() driverData: any) {
    return this.driversService.createDriver(driverData);
  }

  @Get()
  async getDrivers(
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.driversService.getDrivers(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10
    );
  }

  @Get(':id')
  async getDriver(@Param('id') id: string) {
    return this.driversService.getDriverById(parseInt(id));
  }

  @Put(':id/profile')
  async updateDriverProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() profileData: UpdateDriverProfileDto
  ) {
    return this.driversService.updateDriverProfile(id, profileData);
  }

  @Put(':id/tax-profile')
  async updateDriverTaxProfile(
    @Param('id') id: string,
    @Body() taxData: any
  ) {
    return this.driversService.updateDriverTaxProfile(parseInt(id), taxData);
  }

  @Get(':id/tax-profile')
  async getDriverTaxProfile(@Param('id') id: string) {
    return this.driversService.getDriverTaxProfile(parseInt(id));
  }

  @Post('driver-info')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 },
      { name: 'licenseUrl', maxCount: 2 },
      { name: 'insuranceUrl', maxCount: 1 },
      { name: 'vehiclePhotos', maxCount: 10 },
      { name: 'truckPhotos', maxCount: 10 },
    ], {
      storage: storage
    }),
  )
  async createDriverInfo(
    @Body() driverData: DriverData,
    @UploadedFiles() files: UploadedFiles,
  ) {
    if (!driverData.fullName) throw new BadRequestException('Full name is required');
    if (!driverData.email) throw new BadRequestException('Email is required');
    if (!driverData.country) throw new BadRequestException('Country is required');
    if (!driverData.termsAccepted) throw new BadRequestException('Terms must be accepted');

    // Parse languages if provided
    let parsedLanguages: string[] = [];
    if (driverData.languages) {
      try {
        parsedLanguages = JSON.parse(driverData.languages);
      } catch (e) {
        parsedLanguages = [];
      }
    }

    // Convert termsAccepted to boolean
    const termsAccepted = String(driverData.termsAccepted).toLowerCase() === 'true';

    // Add file URLs to driver data
    const processedData = {
      ...driverData,
      termsAccepted,
      languages: parsedLanguages,
      profilePic: files.profilePic?.[0]?.path,
      licenseUrl: files.licenseUrl?.[0]?.path,
      insuranceUrl: files.insuranceUrl?.[0]?.path,
      vehiclePhotos: files.vehiclePhotos?.map(file => file.path) || [],
      truckPhotos: files.truckPhotos?.map(file => file.path) || [],
    };

    return this.driversService.createDriver(processedData);
  }

  @Post('driver-info/:driverProfileId/tax-profile')
  async createOrUpdateTaxProfile(
    @Param('driverProfileId', ParseIntPipe) driverProfileId: number,
    @Body() taxData: { legalName: string; ssnOrEin: string; mailingAddress: string; consent1099: boolean },
  ) {
    return this.driversService.createOrUpdateTaxProfile(driverProfileId, taxData);
  }

  @Post('driver-info/:driverProfileId/earnings')
  async updateEarnings(
    @Param('driverProfileId', ParseIntPipe) driverProfileId: number,
    @Body('earnings', ParseIntPipe) earnings: number,
  ) {
    if (earnings < 0) {
      throw new BadRequestException('Earnings cannot be negative.');
    }
    return this.driversService.updateDriverEarnings(driverProfileId, earnings);
  }

  @Patch('driver-info/:id/approve')
  async approveDriver(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.updateDriverStatus(id, 'ACTIVE');
  }

  @Patch('driver-info/:id/reject')
  async rejectDriver(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.updateDriverStatus(id, 'INACTIVE');
  }
}