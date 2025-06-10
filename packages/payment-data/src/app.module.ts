import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { PaymentStreamModule } from './payment-stream/payment-stream.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentSessionsModule } from './payment-sessions/payment-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PaymentRequestsModule,
    PaymentSessionsModule,
    PaymentStreamModule
  ]
})
export class AppModule {} 