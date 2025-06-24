import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefundStatus } from '@prisma/client';

@Injectable()
export class RefundRequestsService {
  constructor(private prisma: PrismaService) {}

  async getRefundRequests(status?: string) {
    const where = status && status !== 'ALL' ? { status: status as RefundStatus } : {};

    const refundRequests = await this.prisma.refundRequest.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        ride: {
          select: {
            id: true,
            pickupLocation: true,
            dropoffLocation: true,
            totalPrice: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return refundRequests;
  }

  async reviewRefundRequest(id: number, status: string, reviewNotes: string) {
    const updatedRequest = await this.prisma.refundRequest.update({
      where: { id },
      data: {
        status: status as RefundStatus,
        reviewNotes,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        ride: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
      },
    });

    // If the refund is approved, create a refund transaction
    if (status === 'APPROVED') {
      // Get the customer's wallet
      const customerWallet = await this.prisma.wallet.findUnique({
        where: { userId: updatedRequest.customerId },
      });

      if (customerWallet) {
        // Get the ride details
        const ride = await this.prisma.ride.findUnique({
          where: { id: updatedRequest.rideId },
          select: { totalPrice: true },
        });

        if (!ride?.totalPrice) {
          return updatedRequest;
        }

        // Create a refund transaction
        await this.prisma.transaction.create({
          data: {
            walletId: customerWallet.id,
            userId: updatedRequest.customerId,
            amount: ride.totalPrice,
            type: 'REFUND',
            status: 'COMPLETED',
            method: 'WALLET',
            description: `Refund for ride #${updatedRequest.rideId}`,
          },
        });

        // Update wallet balance
        await this.prisma.wallet.update({
          where: { id: customerWallet.id },
          data: {
            balance: {
              increment: ride.totalPrice,
            },
          },
        });
      }
    }

    return updatedRequest;
  }
} 