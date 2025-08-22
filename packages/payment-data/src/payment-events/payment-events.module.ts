import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEventEntity } from '../entities/payment-event.entity';
import { PaymentEventsService } from './payment-events.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEventEntity])],
  providers: [PaymentEventsService],
  exports: [PaymentEventsService]
})
export class PaymentEventsModule {}
