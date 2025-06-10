import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentProducerService } from './payment-producer.service';

@Global()
@Module({
  imports: [
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
  providers: [PaymentProducerService],
  exports: [PaymentProducerService],
})
export class KafkaModule {} 