import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentSessionsController } from './payment-sessions.controller';
import { PaymentSessionsService } from './payment-sessions.service';
import { SessionExpirationService } from './session-expiration.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, PaymentSessionEntity])],
  controllers: [PaymentsController, PaymentSessionsController],
  providers: [PaymentsService, PaymentSessionsService,SessionExpirationService],
  exports: [PaymentsService, PaymentSessionsService,SessionExpirationService]
})
export class PaymentsModule {}
