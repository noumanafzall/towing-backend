import { Controller, Get, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guards';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../users/entities/user.entity';

@Controller('refund-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RefundRequestsController {
  constructor(private readonly refundRequestsService: RefundRequestsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getRefundRequests(@Query('status') status?: string) {
    return this.refundRequestsService.getRefundRequests(status);
  }

  @Put(':id/review')
  @Roles(Role.ADMIN, Role.MODERATOR)
  async reviewRefundRequest(
    @Param('id') id: string,
    @Body() data: { status: string; reviewNotes: string },
  ) {
    return this.refundRequestsService.reviewRefundRequest(
      parseInt(id),
      data.status,
      data.reviewNotes,
    );
  }
} 