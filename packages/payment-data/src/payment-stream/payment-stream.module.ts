import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentStreamService } from './payment-stream.service';
import { PaymentRequestsModule } from '../payment-requests/payment-requests.module';
import { PaymentSessionsModule } from '../payment-sessions/payment-sessions.module';

@Module({
  imports: [
    PaymentRequestsModule, PaymentSessionsModule,
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