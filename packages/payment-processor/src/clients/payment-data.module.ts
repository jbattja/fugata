import { Global, Module } from '@nestjs/common';
import { PaymentDataClient } from '@fugata/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: PaymentDataClient,
      useFactory: (configService: ConfigService) => {
        return new PaymentDataClient(
          configService.get('PAYMENT_DATA_SERVICE_URL', 'http://payment-data:3001')
        );
      },
      inject: [ConfigService],
    }
  ],
  exports: [PaymentDataClient],
})
export class PaymentDataModule {}
