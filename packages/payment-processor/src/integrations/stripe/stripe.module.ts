import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripePaymentIntentService } from './stripe-payment-intent.service';
import { PaymentRoutingModule } from 'src/payment/routing/payment-routing.module';
import { OnModuleInit } from '@nestjs/common';
import { PaymentRouter } from 'src/payment/routing/payment.router';
@Module({
  imports: [PaymentRoutingModule],
  controllers: [StripeController],
  providers: [StripePaymentIntentService],
  exports: [StripePaymentIntentService]
})
export class StripeModule implements OnModuleInit {
  constructor(
    private readonly paymentRouter: PaymentRouter,
    private readonly stripeService: StripePaymentIntentService,
  ) {}

  onModuleInit() {
    // Register providers when the module initializes
    this.paymentRouter.registerProvider(this.stripeService);
  }
} 
 