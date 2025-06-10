import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentSessionsController } from './payment-sessions.controller';
import { PaymentSessionsService } from './payment-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentSessionEntity])],
  controllers: [PaymentSessionsController],
  providers: [PaymentSessionsService],
  exports: [PaymentSessionsService]
})
export class PaymentSessionsModule {} 