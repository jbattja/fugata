import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { PaymentStreamModule } from './payment-stream/payment-stream.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PaymentRequestsModule,
    PaymentStreamModule
  ]
})
export class AppModule {} 