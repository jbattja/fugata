import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentRequestsService } from '../payment-requests/payment-requests.service';
import { PaymentRequest } from '@fugata/shared';

@Injectable()
export class PaymentStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentStreamService.name);

  constructor(
    private readonly paymentRequestsService: PaymentRequestsService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    try {
      // Using NestJS's kafkaClient.subscribeToResponseOf('payment-requests') with kafkaClient.connect()
      // in combination with the @EventPattern('payment-requests') or @MessagePattern('payment-requests') does not work. 
      // The below does work, even though it feels like a hack. 
      await this.kafkaClient.connect(); // initiate the consumer
      const kafka = (this.kafkaClient as any).consumer;
      await kafka.stop(); // need to stop it again before subscribing
      await kafka.subscribe({ topic: 'payment-requests', fromBeginning: true });
      await kafka.run({
        eachMessage: async ({ message }) => {
          try {
            const paymentRequest = JSON.parse(message.value.toString());
            await this.onPaymentRequest(paymentRequest);
          } catch (error) {
            this.logger.error('Error processing message:', error);
          }
        },
      });
    } catch (error) {
      this.logger.error('Failed to initialize PaymentStreamService:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.kafkaClient.close();
    } catch (error) {
      this.logger.error('Error closing Kafka client:', error);
    }
  }


  private async onPaymentRequest(paymentRequest: PaymentRequest): Promise<void> {
    try {
      await this.paymentRequestsService.createPaymentRequest(paymentRequest);
    } catch (error) {
      this.logger.error('Error saving payment request:', error);
      throw error;
    }
  }
} 