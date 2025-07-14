import { PaymentRequest, PaymentSession } from '@fugata/shared';
import { Inject } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { ClientKafka } from '@nestjs/microservices';
export class PaymentProducerService {

  constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {
  }

  async connect(): Promise<void> {
    await this.kafkaClient.connect();
  }

  async disconnect(): Promise<void> {
    await this.kafkaClient.close();
  }

  async publishPaymentRequest(paymentRequest: PaymentRequest): Promise<void> {
    SharedLogger.log(`Publishing payment request to Kafka: ${JSON.stringify(paymentRequest)}`, undefined, PaymentProducerService.name);
    await this.kafkaClient.producer.send({
      topic: 'payment-requests',
      messages: [
        {
          key: paymentRequest.fugataReference,
          value: JSON.stringify(paymentRequest)
        }
      ]
    });
  }
  async publishPaymentSession(paymentSession: PaymentSession): Promise<void> {
    SharedLogger.log(`Publishing payment session to Kafka: ${JSON.stringify(paymentSession)}`, undefined, PaymentProducerService.name);
    await this.kafkaClient.producer.send({
      topic: 'payment-sessions',
      messages: [
        {
          key: paymentSession.sessionId,
          value: JSON.stringify(paymentSession)
        }
      ]
    });
  }
} 