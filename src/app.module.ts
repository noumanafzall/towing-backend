import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { CustomersModule } from './customers/customers.module';
import { RidesModule } from './rides/rides.module';
import { LocationModule } from './location/location.module';
import { EncryptionModule } from './utils/encryption.module';
import { GoogleMapsModule } from './utils/google-maps.module';
import { WalletModule } from './wallet/wallet.module';
import { SettingsModule } from './settings/settings.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RefundRequestsModule } from './refund-requests/refund-requests.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    DriversModule,
    CustomersModule,
    RidesModule,
    LocationModule,
    EncryptionModule,
    GoogleMapsModule,
    WalletModule,
    SettingsModule,
    InvoicesModule,
    RefundRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
