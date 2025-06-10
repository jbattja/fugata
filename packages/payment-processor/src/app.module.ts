import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { StripeModule } from './integrations/stripe/stripe.module';
import { AdyenModule } from './integrations/adyen/adyen.module';
import { TransformerErrorFilter } from './filters/transformer-error.filter';
import { APP_FILTER } from '@nestjs/core';
import { SessionsModule } from './payment/sessions.module';
import { KafkaModule } from './kafka/kafka.module';
import { PaymentProducerService } from './kafka/payment-producer.service';

@Module({
  imports: [
    KafkaModule,
    StripeModule,
    AdyenModule,
    SessionsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: TransformerErrorFilter,
    }
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly paymentProducer: PaymentProducerService) {}

  async onModuleInit() {
    await this.paymentProducer.connect();
  }

  async onModuleDestroy() {
    await this.paymentProducer.disconnect();
  }
}
