import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentStreamService } from './payment-stream.service';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentEventsModule } from '../payment-events/payment-events.module';
import { OperationsModule } from '../operations/operations.module';

@Module({
  imports: [
    PaymentsModule, PaymentEventsModule, OperationsModule,
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