import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoiceStatus } from '@prisma/client';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(
    @Query('status') status?: string,
    @Query('dateRange') dateRange?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.invoicesService.getInvoices({
      status: status === 'ALL' ? undefined : status as InvoiceStatus,
      dateRange: dateRange === 'ALL' ? undefined : dateRange,
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 10,
    });
  }

  @Get(':id')
  async getInvoice(@Param('id') id: string) {
    return this.invoicesService.getInvoice(parseInt(id));
  }

  @Post(':id/pay')
  async payInvoice(@Param('id') id: string) {
    return this.invoicesService.payInvoice(parseInt(id));
  }

  @Get(':id/download')
  async downloadInvoice(@Param('id') id: string) {
    return this.invoicesService.generateInvoicePDF(parseInt(id));
  }
} 