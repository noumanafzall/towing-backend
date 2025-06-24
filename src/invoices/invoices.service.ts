import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

interface GetInvoicesParams {
  status?: InvoiceStatus;
  dateRange?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async getInvoices({ status, dateRange, skip = 0, take = 10 }: GetInvoicesParams) {
    const where: any = {};
    
    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add date range filter
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case 'THIS_MONTH':
          where.createdAt = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          };
          break;
        case 'LAST_MONTH':
          where.createdAt = {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: new Date(now.getFullYear(), now.getMonth(), 1),
          };
          break;
        case 'LAST_3_MONTHS':
          where.createdAt = {
            gte: new Date(now.getFullYear(), now.getMonth() - 3, 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          };
          break;
        case 'THIS_YEAR':
          where.createdAt = {
            gte: new Date(now.getFullYear(), 0, 1),
            lt: new Date(now.getFullYear() + 1, 0, 1),
          };
          break;
      }
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              fullName: true,
              role: true,
              profilePic: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  async getInvoice(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            role: true,
            profilePic: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async payInvoice(id: number) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    if (invoice.status !== InvoiceStatus.PENDING) {
      throw new Error('Invoice cannot be paid - invalid status');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidDate: new Date(),
      },
    });
  }

  async generateInvoicePDF(id: number) {
    const invoice = await this.getInvoice(id);
    // TODO: Implement PDF generation logic
    return invoice;
  }
} 