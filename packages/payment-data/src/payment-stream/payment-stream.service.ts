import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Operation, PaymentStatus, SessionStatus, SharedLogger } from '@fugata/shared';
import { PaymentSessionsService } from '../payments/payment-sessions.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentEventsService } from '../payment-events/payment-events.service';
import { OperationsService } from '../operations/operations.service';
import { PaymentSession, PaymentEvent, Payment } from '@fugata/shared';

@Injectable()
export class PaymentStreamService implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly paymentSessionsService: PaymentSessionsService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentEventsService: PaymentEventsService,
    private readonly operationsService: OperationsService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      const kafka = (this.kafkaClient as any).consumer;
      await kafka.stop();

      // Subscribe to multiple topics
      await kafka.subscribe({
        topics: ['payment-sessions', 'payments'],
        fromBeginning: true
      });

      await kafka.run({
        eachMessage: async ({ topic, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            
            // Route messages to appropriate handlers based on topic
            switch (topic) {
              case 'payment-sessions':
                await this.onPaymentSession(payload);
                break;
              case 'payments':
                await this.onPayment(payload);
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

  private async onPaymentSession(paymentSession: PaymentSession): Promise<void> {
    try {
      SharedLogger.log(`Processing payment session: ${paymentSession.sessionId}`, undefined, PaymentStreamService.name);
      await this.paymentSessionsService.createPaymentSession(paymentSession);
    } catch (error) {
      SharedLogger.error('Error processing payment session:', error, PaymentStreamService.name);
      throw error;
    }
  }

  private async onPayment(event: PaymentEvent): Promise<void> {
    try {
      const { paymentId, eventType, timestamp } = event;
      const eventTime = new Date(timestamp);
      
      SharedLogger.log(`Processing payment event: ${eventType} for payment ${paymentId} at ${timestamp}`, undefined, PaymentStreamService.name);
      
      // Always store the event first (event sourcing)
      await this.paymentEventsService.storeEvent(event);
      
      // Check if payment exists
      const existingPayment = await this.paymentsService.getPayment(paymentId);
      
      if (!existingPayment) {
        // Create new payment if it doesn't exist
        const paymentWithTimestamp = {
          ...event.data.payment,
          updatedAt: eventTime // Use event timestamp for updatedAt
        };
        await this.paymentsService.createPayment(paymentWithTimestamp);
        SharedLogger.log(`Created new payment: ${paymentId}`, undefined, PaymentStreamService.name);
      } else {
        // Check if this event is newer than the existing payment
        const existingTime = new Date(existingPayment.updatedAt || existingPayment.createdAt);
        
        if (eventTime > existingTime) {
          // This event is newer, update the payment
          const paymentWithTimestamp = {
            ...event.data.payment,
            updatedAt: eventTime // Use event timestamp for updatedAt
          };
          await this.paymentsService.updatePayment(paymentId, paymentWithTimestamp);
          SharedLogger.log(`Updated payment: ${paymentId} with newer event from ${timestamp}`, undefined, PaymentStreamService.name);
        } else {
          // Replay all events to get the complete current state
          const replayedPayment = await this.paymentEventsService.replayEventsForPayment(paymentId);
          await this.paymentsService.updatePayment(paymentId, replayedPayment);
          SharedLogger.warn(`Replayed payment: ${paymentId} with newer event from ${timestamp}`, undefined, PaymentStreamService.name);
        }
      }
      if (event.data.payment.sessionId) {
        await this.updatePaymentSession(event.data.payment.sessionId, event.data.payment);
      }
      if (event.data.operations) {
        await this.processOperations(event.data.operations);
      }
    } catch (error) {
      SharedLogger.error('Error processing payment event:', error, PaymentStreamService.name);
      throw error;
    }
  }

  private async processOperations(operations: Operation[]): Promise<void> {
    for (const operation of operations) {
      await this.operationsService.storeOperation(operation);
    }
  }

  private async updatePaymentSession(sessionId: string, payment: Payment): Promise<void> {
    const paymentSession = await this.paymentSessionsService.getPaymentSession(sessionId);
    if (!paymentSession) {
      return;
    }
    const sessionIsExpired = paymentSession.expiresAt < new Date();
    switch (payment.status) {
      case PaymentStatus.INITIATED:
        paymentSession.status = SessionStatus.PENDING;
        break;
      case PaymentStatus.AUTHORIZED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      case PaymentStatus.REFUSED:
        sessionIsExpired ? paymentSession.status = SessionStatus.FAILED : paymentSession.status = SessionStatus.ACTIVE;
        break;
      case PaymentStatus.PARTIALLY_CAPTURED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      case PaymentStatus.CAPTURED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      case PaymentStatus.VOIDED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      case PaymentStatus.REVERSED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      case PaymentStatus.REFUNDED:
        paymentSession.status = SessionStatus.COMPLETED;
        break;
      default:
        sessionIsExpired ? paymentSession.status = SessionStatus.EXPIRED : paymentSession.status = SessionStatus.ACTIVE;
        break;
    }
    await this.paymentSessionsService.updatePaymentSession(sessionId, paymentSession); 
  }
} 