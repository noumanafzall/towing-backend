import { Controller, Post, Body, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDriverDto } from './dtos/register-driver.dto';
import { RegisterCustomerDto } from './dtos/register-customer.dto';
import { LoginDto } from './dtos/login.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/driver')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePic', maxCount: 1 },
      { name: 'licenseUrl', maxCount: 1 },
      { name: 'insuranceUrl', maxCount: 1 },
      { name: 'vehiclePhotos', maxCount: 10 },
      { name: 'truckPhotos', maxCount: 10 },
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const destinations = {
            'profilePic': './uploads/profilePics',
            'licenseUrl': './uploads/licenses',
            'insuranceUrl': './uploads/insurances',
            'vehiclePhotos': './uploads/vehiclePhotos',
            'truckPhotos': './uploads/truckPhotos',
          };
          cb(null, destinations[file.fieldname]);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async registerDriver(
    @UploadedFiles() files: {
      profilePic?: Express.Multer.File[];
      licenseUrl?: Express.Multer.File[];
      insuranceUrl?: Express.Multer.File[];
      vehiclePhotos?: Express.Multer.File[];
      truckPhotos?: Express.Multer.File[];
    },
    @Body() registerDriverDto: RegisterDriverDto,
  ) {
    // Safely handle potentially undefined files object
    files = files || {};
    
    const profilePic = files.profilePic?.[0];
    const licenseUrl = files.licenseUrl?.[0];
    const insuranceUrl = files.insuranceUrl?.[0];
    const vehiclePhotos = files.vehiclePhotos || [];
    const truckPhotos = files.truckPhotos || [];

    return this.authService.registerDriver(profilePic, licenseUrl, insuranceUrl, vehiclePhotos, truckPhotos, registerDriverDto);
  }

  @Post('register/customer')
  async registerCustomer(@Body() registerCustomerDto: RegisterCustomerDto) {
    return this.authService.registerCustomer(registerCustomerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}