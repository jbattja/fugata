import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentStreamService } from './payment-stream.service';
import { PaymentSessionsModule } from '../payment-sessions/payment-sessions.module';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentEventsModule } from '../payment-events/payment-events.module';

@Module({
  imports: [
    PaymentSessionsModule, PaymentsModule, PaymentEventsModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-data',
            brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
          },
          consumer: {
            groupId: 'payment-data-group',
          }
        },
      },
    ]),
  ],
  providers: [PaymentStreamService],
  exports: [PaymentStreamService],
})
export class PaymentStreamModule {} 