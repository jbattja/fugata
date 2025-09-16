import { PaymentSession, Payment, PaymentEvent, PaymentEventType, PaymentEventData, Operation, Refund, Capture, Void } from '@fugata/shared';
import { Inject } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { ClientKafka } from '@nestjs/microservices';
import { TokenizationUtils } from 'src/core/tokenization.utils';
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

  async publishPaymentEvent(payment: Payment, eventType: PaymentEventType, operations?: Operation[]): Promise<void> {
    // Create a deep copy of the payment object to avoid modifying the original
    const paymentToPublish = JSON.parse(JSON.stringify(payment));
    
    if (paymentToPublish.paymentInstrument) {
      paymentToPublish.paymentInstrument = TokenizationUtils.cleanUpSensitiveData(paymentToPublish.paymentInstrument);
    }
    
    const eventData: PaymentEventData = {
      payment: paymentToPublish,
      operations: operations || []
    };
    
    const event: PaymentEvent = {
      eventType,
      paymentId: paymentToPublish.paymentId,
      timestamp: new Date().toISOString(),
      data: eventData
    };

    SharedLogger.log(`Publishing payment event: ${eventType} for payment ${payment.paymentId}${operations ? ` with ${operations.length} operations` : ''}`, undefined, PaymentProducerService.name);
    
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

  async publishPaymentCaptured(payment: Payment, captureOperation: Capture): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_CAPTURED, [captureOperation]);
  }

  async publishPaymentVoided(payment: Payment, voidOperation: Void): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_VOIDED, [voidOperation]);
  }

  async publishPaymentRefunded(payment: Payment, refundOperation: Refund): Promise<void> {
    await this.publishPaymentEvent(payment, PaymentEventType.PAYMENT_REFUNDED, [refundOperation]);
  }
} 