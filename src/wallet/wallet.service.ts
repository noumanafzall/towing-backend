import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, TransactionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            role: true
          }
        }
      }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async createWallet(userId: number) {
    const existingWallet = await this.prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      throw new BadRequestException('Wallet already exists');
    }

    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'USD'
      }
    });

    return wallet;
  }

  async getTransactions(userId: number, skip = 0, take = 10) {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: true,
          user: {
            select: {
              email: true,
              fullName: true,
              role: true
            }
          }
        }
      }),
      this.prisma.transaction.count({
        where: { userId }
      })
    ]);

    return { transactions, total };
  }

  async deposit(userId: number, amount: number, method: PaymentMethod) {
    const wallet = await this.getWallet(userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        method
      }
    });

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    return transaction;
  }

  async withdraw(userId: number, amount: number, method: PaymentMethod) {
    const wallet = await this.getWallet(userId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        method
      }
    });

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    return transaction;
  }

  async processRidePayment(rideId: number) {
    const ride = await this.prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        driver: true,
        customer: true
      }
    });

    if (!ride) {
      throw new NotFoundException('Ride not found');
    }

    const amount = ride.totalPrice || 0;

    // Process customer payment
    const customerTransaction = await this.prisma.transaction.create({
      data: {
        walletId: (await this.getWallet(ride.customerId)).id,
        userId: ride.customerId,
        amount,
        type: TransactionType.RIDE_PAYMENT,
        status: TransactionStatus.COMPLETED,
        method: PaymentMethod.WALLET
      }
    });

    // Process driver earning
    const driverTransaction = await this.prisma.transaction.create({
      data: {
        walletId: (await this.getWallet(ride.driverId)).id,
        userId: ride.driverId,
        amount,
        type: TransactionType.RIDE_EARNING,
        status: TransactionStatus.COMPLETED,
        method: PaymentMethod.WALLET
      }
    });

    // Update wallet balances
    await Promise.all([
      this.prisma.wallet.update({
        where: { userId: ride.customerId },
        data: {
          balance: {
            decrement: amount
          }
        }
      }),
      this.prisma.wallet.update({
        where: { userId: ride.driverId },
        data: {
          balance: {
            increment: amount
          }
        }
      })
    ]);

    return {
      customerTransaction,
      driverTransaction
    };
  }

  async getAllTransactions(skip = 0, take = 10) {
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: true,
          user: {
            select: {
              email: true,
              fullName: true,
              role: true,
              profilePic: true,
              customerProfile: true,
              driverProfile: true
            }
          }
        }
      }),
      this.prisma.transaction.count()
    ]);

    return { transactions, total };
  }
} 