import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentSessionsController } from './payment-sessions.controller';
import { PaymentSessionsService } from './payment-sessions.service';
import { SessionExpirationService } from './session-expiration.service';
import { OperationsService } from '../operations/operations.service';
import { OperationEntity } from '../entities/operation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity, PaymentSessionEntity, OperationEntity])],
  controllers: [PaymentsController, PaymentSessionsController],
  providers: [PaymentsService, PaymentSessionsService, SessionExpirationService, OperationsService],
  exports: [PaymentsService, PaymentSessionsService, SessionExpirationService, OperationsService]
})
export class PaymentsModule {}
