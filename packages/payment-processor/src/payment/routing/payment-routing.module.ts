import { Module } from '@nestjs/common';
import { PaymentRouter } from './payment.router';
import { SettingsModule } from '../../clients/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [PaymentRouter],
  exports: [PaymentRouter],
})
export class PaymentRoutingModule {} 