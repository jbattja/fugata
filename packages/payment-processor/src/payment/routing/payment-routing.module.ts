import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PaymentRouter } from './payment.router';
import { SettingsModule } from '../../settings/settings.module';
import { PaymentProducerService } from 'src/kafka/payment-producer.service';
import { Transport } from '@nestjs/microservices';
import { ClientsModule } from '@nestjs/microservices';

@Global()
@Module({
  imports: [SettingsModule,
    ClientsModule.register([
    {
      name: 'KAFKA_SERVICE',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'payment-processor',
          brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
        },
        producerOnlyMode: true,
      },
    },
  ]),
],
  providers: [PaymentRouter, PaymentProducerService],
  exports: [PaymentRouter],
})
export class PaymentRoutingModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly paymentProducer: PaymentProducerService) {}

  async onModuleInit() {
    await this.paymentProducer.connect();
  }

  async onModuleDestroy() {
    await this.paymentProducer.disconnect();
  }
} 