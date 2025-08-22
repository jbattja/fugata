import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PaymentStreamModule } from './payment-stream/payment-stream.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentSessionsModule } from './payment-sessions/payment-sessions.module';
import { PaymentsModule } from './payments/payments.module';
import { PaymentEventsModule } from './payment-events/payment-events.module';
import { ServiceAuthGuard } from '@fugata/shared';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PaymentSessionsModule,
    PaymentsModule,
    PaymentEventsModule,
    PaymentStreamModule
  ],
  providers: [
    {
      provide: 'JWT_SECRET',
      useValue: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    },
    {
      provide: APP_GUARD,
      useFactory: (jwtSecret: string) => new ServiceAuthGuard(jwtSecret),
      inject: ['JWT_SECRET'],
    }
  ],
})
export class AppModule {} 