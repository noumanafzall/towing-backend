import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RidesModule } from './rides/rides.module';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { WalletModule } from './wallet/wallet.module';
import { SettingsModule } from './settings/settings.module';
import { LocationModule } from './location/location.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RefundRequestsModule } from './refund-requests/refund-requests.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RidesModule,
    DriversModule,
    CustomersModule,
    WalletModule,
    SettingsModule,
    LocationModule,
    InvoicesModule,
    RefundRequestsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
