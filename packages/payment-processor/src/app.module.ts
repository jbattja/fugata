import { Module } from '@nestjs/common';
import { StripeModule } from './integrations/stripe/stripe.module';
import { AdyenModule } from './integrations/adyen/adyen.module';
import { TransformerErrorFilter } from './filters/transformer-error.filter';
import { APP_FILTER } from '@nestjs/core';
@Module({
  imports: [StripeModule, AdyenModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: TransformerErrorFilter,
    },
  ],
})
export class AppModule {} 