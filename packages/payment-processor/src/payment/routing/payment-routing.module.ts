import { Module } from '@nestjs/common';
import { PaymentRouter } from './payment.router';

@Module({
  providers: [PaymentRouter],
  exports: [PaymentRouter],
})
export class PaymentRoutingModule {} 