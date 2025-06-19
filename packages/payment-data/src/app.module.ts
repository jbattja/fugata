import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { PaymentStreamModule } from './payment-stream/payment-stream.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentSessionsModule } from './payment-sessions/payment-sessions.module';
import { ServiceAuthGuard } from '@fugata/shared';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PaymentRequestsModule,
    PaymentSessionsModule,
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