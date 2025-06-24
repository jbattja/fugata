import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { PaymentsController } from './payment.controller';

@Module({
  controllers: [SessionsController, PaymentsController],
  providers: [],
})
export class PaymentsModule {} 