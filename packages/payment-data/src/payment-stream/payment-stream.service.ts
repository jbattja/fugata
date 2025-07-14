import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentRequestsService } from '../payment-requests/payment-requests.service';
import { PaymentSessionsService } from '../payment-sessions/payment-sessions.service';
import { PaymentRequest, PaymentSession } from '@fugata/shared';

@Injectable()
export class PaymentStreamService implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly paymentRequestsService: PaymentRequestsService,
    private readonly paymentSessionsService: PaymentSessionsService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      const kafka = (this.kafkaClient as any).consumer;
      await kafka.stop();

      // Subscribe to multiple topics
      await kafka.subscribe({
        topics: ['payment-requests', 'payment-sessions'],
        fromBeginning: true
      });

      await kafka.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            
            // Route messages to appropriate handlers based on topic
            switch (topic) {
              case 'payment-requests':
                await this.onPaymentRequest(payload);
                break;
              case 'payment-sessions':
                await this.onPaymentSession(payload);
                break;
              default:
                SharedLogger.warn(`Received message from unknown topic: ${topic}`, undefined, PaymentStreamService.name);
            }
          } catch (error) {
            SharedLogger.error(`Error processing message from topic ${topic}:`, error, PaymentStreamService.name);
          }
        },
      });
    } catch (error) {
      SharedLogger.error('Failed to initialize PaymentStreamService:', error, PaymentStreamService.name);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.kafkaClient.close();
    } catch (error) {
      SharedLogger.error('Error closing Kafka client:', error, PaymentStreamService.name);
    }
  }

  private async onPaymentRequest(paymentRequest: PaymentRequest): Promise<void> {
    try {
      await this.paymentRequestsService.createPaymentRequest(paymentRequest);
    } catch (error) {
      SharedLogger.error('Error saving payment request:', error, PaymentStreamService.name);
      throw error;
    }
  }

  private async onPaymentSession(paymentSession: PaymentSession): Promise<void> {
    try {
      await this.paymentSessionsService.createPaymentSession(paymentSession);
    } catch (error) {
      SharedLogger.error('Error saving payment session:', error, PaymentStreamService.name);
      throw error;
    }
  }
} 