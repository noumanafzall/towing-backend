import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDriverDto } from './dtos/register-driver.dto';
import { RegisterCustomerDto } from './dtos/register-customer.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerDriver(
    profilePic: Express.Multer.File | undefined,
    licenseUrl: Express.Multer.File | undefined,
    insuranceUrl: Express.Multer.File | undefined,
    vehiclePhotos: Express.Multer.File[],
    truckPhotos: Express.Multer.File[],
    dto: RegisterDriverDto,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const profilePicUrl = profilePic ? `/uploads/profilePics/${profilePic.filename}` : null;
    const licenseUrlPath = licenseUrl ? `/uploads/licenses/${licenseUrl.filename}` : null;
    const insuranceUrlPath = insuranceUrl ? `/uploads/insurances/${insuranceUrl.filename}` : null;
    const vehiclePhotosPaths = vehiclePhotos?.map((file) => `/uploads/vehiclePhotos/${file.filename}`) || [];
    const truckPhotosPaths = truckPhotos?.map((file) => `/uploads/truckPhotos/${file.filename}`) || [];

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: 'DRIVER',
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        country: dto.country,
        profilePic: profilePicUrl,
        driverProfile: {
          create: {
            licenseUrl: licenseUrlPath,
            insuranceUrl: insuranceUrlPath,
            vehiclePhotos: vehiclePhotosPaths,
            truckType: dto.truckType,
            truckCapacity: dto.truckCapacity,
            truckPhotos: truckPhotosPaths,
            languages: dto.languages || [],
            termsAccepted: dto.termsAccepted,
            experience: dto.experience,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    return { user, access_token: token };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        fullName: dto.fullName,
        phoneNumber: dto.phoneNumber,
        country: dto.country,
        city: dto.city,
        customerProfile: {
          create: {
            termsAccepted: dto.termsAccepted,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        country: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    return { user, access_token: token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      access_token: token,
    };
  }
}