import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PaymentMethod } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('all-transactions')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getAllTransactions(
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.walletService.getAllTransactions(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10
    );
  }

  @Get(':userId')
  async getWallet(@Param('userId') userId: string) {
    return this.walletService.getWallet(parseInt(userId));
  }

  @Post(':userId')
  async createWallet(@Param('userId') userId: string) {
    return this.walletService.createWallet(parseInt(userId));
  }

  @Get(':userId/transactions')
  async getTransactions(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string
  ) {
    return this.walletService.getTransactions(
      parseInt(userId),
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10
    );
  }

  @Post(':userId/deposit')
  async deposit(
    @Param('userId') userId: string,
    @Body() data: { amount: number; method: PaymentMethod }
  ) {
    return this.walletService.deposit(parseInt(userId), data.amount, data.method);
  }

  @Post(':userId/withdraw')
  async withdraw(
    @Param('userId') userId: string,
    @Body() data: { amount: number; method: PaymentMethod }
  ) {
    return this.walletService.withdraw(parseInt(userId), data.amount, data.method);
  }

  @Post('ride/:rideId/payment')
  async processRidePayment(@Param('rideId') rideId: string) {
    return this.walletService.processRidePayment(parseInt(rideId));
  }
} 