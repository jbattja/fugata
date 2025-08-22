import { PaymentSession, Payment, PaymentEvent, PaymentEventType } from '@fugata/shared';
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

  async publishPaymentEvent(payment: Payment, eventType: PaymentEventType): Promise<void> {
    const event: PaymentEvent = {
      eventType,
      paymentId: payment.paymentId,
      timestamp: new Date().toISOString(),
      data: payment
    };

    SharedLogger.log(`Publishing payment event: ${eventType} for payment ${payment.paymentId}`, undefined, PaymentProducerService.name);
    
    // Use paymentId as the key to ensure all events for the same payment go to the same partition
    await this.kafkaClient.producer.send({
      topic: 'payments',
      messages: [
        {
          key: payment.paymentId,
          value: JSON.stringify(event)
        }
      ]
    });
  }

  // Convenience methods for common payment events
  async publishPaymentInitiated(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_INITIATED);
  }

  async publishPaymentAuthenticated(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_AUTHENTICATED);
  }

  async publishPaymentAuthorized(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_AUTHORIZED);
  }

  async publishPaymentCaptured(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_CAPTURED);
  }

  async publishPaymentVoided(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_VOIDED);
  }

  async publishPaymentRefunded(payment: Payment): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_REFUNDED);
  }
} 