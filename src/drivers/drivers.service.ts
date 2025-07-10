import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import * as path from 'path';
import { EncryptionService } from '../utils/encryption.service';
import { Role } from '../users/entities/user.entity';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class DriversService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService
  ) {}

  private formatFilePath(path: string | null) {
    if (!path) return null;
    return path.startsWith('http') ? path : `${process.env.FILE_SERVER_URL}/${path}`;
  }

  async getDrivers(skip = 0, take = 10) {
    const [drivers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.DRIVER },
        skip,
        take,
        include: {
          driverProfile: {
            include: {
              taxProfile: true
            }
          }
        }
      }),
      this.prisma.user.count({
        where: { role: Role.DRIVER }
      })
    ]);

    return {
      drivers: drivers.map(driver => ({
        ...driver,
        driverProfile: driver.driverProfile ? {
          ...driver.driverProfile,
          licenseUrl: this.formatFilePath(driver.driverProfile.licenseUrl),
          insuranceUrl: this.formatFilePath(driver.driverProfile.insuranceUrl),
          vehiclePhotos: driver.driverProfile.vehiclePhotos?.map(this.formatFilePath),
          truckPhotos: driver.driverProfile.truckPhotos?.map(this.formatFilePath),
          taxProfile: driver.driverProfile.taxProfile
        } : null
      })),
      total
    };
  }

  async getDriverById(id: number) {
    const driver = await this.prisma.user.findUnique({
      where: { id, role: Role.DRIVER },
      include: {
        driverProfile: {
          include: {
            taxProfile: true
          }
        }
      }
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Clear sensitive tax information if encrypted
    if (driver.driverProfile?.taxProfile?.ssnOrEin?.startsWith('$2b$')) {
      await this.prisma.driverTaxProfile.update({
        where: { id: driver.driverProfile.taxProfile.id },
        data: { ssnOrEin: null }
      });
      if (driver.driverProfile.taxProfile) {
        driver.driverProfile.taxProfile.ssnOrEin = null;
      }
    }

    return {
      ...driver,
      driverProfile: driver.driverProfile ? {
        ...driver.driverProfile,
        licenseUrl: this.formatFilePath(driver.driverProfile.licenseUrl),
        insuranceUrl: this.formatFilePath(driver.driverProfile.insuranceUrl),
        vehiclePhotos: driver.driverProfile.vehiclePhotos?.map(this.formatFilePath),
        taxProfile: driver.driverProfile.taxProfile ? {
          ...driver.driverProfile.taxProfile,
          ssnOrEin: driver.driverProfile.taxProfile.ssnOrEin
            ? this.encryptionService.decrypt(driver.driverProfile.taxProfile.ssnOrEin)
            : null
        } : null
      } : null
    };
  }

  async getDriverCount() {
    const count = await this.prisma.user.count({
      where: {
        role: 'DRIVER'
      }
    });
    return { count };
  }

  async createDriver(driverData: any) {
    const existingDriver = await this.prisma.user.findUnique({
      where: { email: driverData.email }
    });

    if (existingDriver) {
      throw new Error('Email already registered');
    }

    const driver = await this.prisma.user.create({
      data: {
        email: driverData.email,
        password: driverData.password,
        fullName: driverData.fullName,
        phoneNumber: driverData.phoneNumber,
        role: Role.DRIVER,
        country: driverData.country || null,
        region: driverData.region || null,
        city: driverData.city || null,
        driverProfile: {
          create: {
            licenseUrl: driverData.licenseUrl || null,
            insuranceUrl: driverData.insuranceUrl || null,
            vehiclePhotos: driverData.vehiclePhotos || [],
            truckType: driverData.truckType || null,
            truckCapacity: driverData.truckCapacity || null,
            truckPhotos: driverData.truckPhotos || [],
            languages: driverData.languages || [],
            termsAccepted: driverData.termsAccepted || false
          }
        }
      },
      include: {
        driverProfile: {
          include: {
            taxProfile: true
          }
        }
      }
    });

    return driver;
  }

  async createOrUpdateTaxProfile(
    userId: number,
    taxData: {
      legalName: string;
      ssnOrEin: string;
      mailingAddress: string;
      consent1099: boolean;
    },
  ) {
    const encryptedSsnOrEin = this.encryptionService.encrypt(taxData.ssnOrEin);
    const existingTaxProfile = await this.prisma.driverTaxProfile.findUnique({
      where: { driverId: userId },
    });

    if (existingTaxProfile) {
      return this.prisma.driverTaxProfile.update({
        where: { id: existingTaxProfile.id },
        data: {
          legalName: taxData.legalName,
          ssnOrEin: encryptedSsnOrEin,
          mailingAddress: taxData.mailingAddress,
          consent1099: taxData.consent1099,
        },
      });
    } else {
      return this.prisma.driverTaxProfile.create({
        data: {
          driverId: userId,
          legalName: taxData.legalName,
          ssnOrEin: encryptedSsnOrEin,
          mailingAddress: taxData.mailingAddress,
          consent1099: taxData.consent1099,
        },
      });
    }
  }

  async updateDriverEarnings(driverProfileId: number, earnings: number) {
    const updatedProfile = await this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data: {
        totalEarnings: {
          increment: earnings
        }
      },
      include: {
        taxProfile: true
      }
    });

    // If total earnings exceed $600 and no tax profile exists, notify the driver
    if (updatedProfile.totalEarnings >= 600 && !updatedProfile.taxProfile) {
      // You might want to implement a notification system here
      console.log(`Driver ${updatedProfile.id} has exceeded $600 in earnings but has no tax profile`);
    }

    return updatedProfile;
  }

  async getDriverTaxProfile(userId: number) {
    const driver = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: {
          include: {
            taxProfile: true
          }
        }
      }
    });

    if (!driver || !driver.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    return driver.driverProfile.taxProfile;
  }

  async updateDriverStatus(id: number, status: RegistrationStatus) {
    const driver = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driverProfile: true
      }
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    if (!driver.driverProfile) {
      throw new BadRequestException('Driver profile not found');
    }

    return this.prisma.driverProfile.update({
      where: { id: driver.driverProfile.id },
      data: { registrationStatus: status }
    });
  }

  async updateDriverTaxProfile(userId: number, taxData: any) {
    const driver = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: {
          include: {
            taxProfile: true
          }
        }
      }
    });

    if (!driver || !driver.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    const taxProfile = await this.prisma.driverTaxProfile.upsert({
      where: { driverId: driver.driverProfile.id },
      update: {
        legalName: taxData.legalName,
        ssnOrEin: this.encryptionService.encrypt(taxData.ssnOrEin),
        taxId: taxData.taxId,
        taxDocumentUrl: taxData.taxDocumentUrl,
        taxRate: taxData.taxRate,
        taxCountry: taxData.taxCountry,
        taxRegion: taxData.taxRegion,
        mailingAddress: taxData.mailingAddress,
        consent1099: taxData.consent1099
      },
      create: {
        driverId: driver.driverProfile.id,
        legalName: taxData.legalName,
        ssnOrEin: this.encryptionService.encrypt(taxData.ssnOrEin),
        taxId: taxData.taxId,
        taxDocumentUrl: taxData.taxDocumentUrl,
        taxRate: taxData.taxRate,
        taxCountry: taxData.taxCountry,
        taxRegion: taxData.taxRegion,
        mailingAddress: taxData.mailingAddress,
        consent1099: taxData.consent1099
      }
    });

    return taxProfile;
  }

  async updateDriverProfile(userId: number, profileData: any) {
    const driver = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: {
          include: {
            taxProfile: true
          }
        }
      }
    });

    if (!driver || !driver.driverProfile) {
      throw new NotFoundException('Driver profile not found');
    }

    // Separate user data and driver profile data
    const { user: userData, ...driverProfileData } = profileData;

    // Update both user and driver profile
    const updatedProfile = await this.prisma.driverProfile.update({
      where: { id: driver.driverProfile.id },
      data: {
        ...driverProfileData,
        user: userData ? {
          update: userData
        } : undefined
      },
      include: {
        user: true,
        taxProfile: true
      }
    });

    // Check if driver needs to submit tax information
    if (updatedProfile.totalEarnings >= 600 && !updatedProfile.taxProfile) {
      console.log(`Driver ${userId} has exceeded $600 in earnings but has no tax profile`);
      // You might want to send a notification or take other actions here
    }

    return updatedProfile;
  }
}