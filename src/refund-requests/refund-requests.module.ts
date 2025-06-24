import { Module } from '@nestjs/common';
import {RefundRequestsController} from './refund-requests.controller'
import { RefundRequestsService } from './refund-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RefundRequestsController],
  providers: [RefundRequestsService],
})
export class RefundRequestsModule {} 