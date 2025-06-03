import { Module, OnModuleInit } from '@nestjs/common';
import { AdyenController } from './adyen.controller';
import { AdyenService } from './adyen.service';
import { PaymentRoutingModule } from 'src/payment/routing/payment-routing.module';
import { PaymentRouter } from 'src/payment/routing/payment.router';

@Module({
  imports: [PaymentRoutingModule],
  controllers: [AdyenController],
  providers: [AdyenService],
  exports: [AdyenService]
})
export class AdyenModule implements OnModuleInit {
  constructor(
    private readonly paymentRouter: PaymentRouter,
    private readonly adyenService: AdyenService,
  ) {}

  onModuleInit() {
    // Register providers when the module initializes
    this.paymentRouter.registerProvider(this.adyenService);
  }
} 