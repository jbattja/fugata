import { Payment } from './payment';
import { Operation } from './operation';

export enum PaymentEventType {
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_AUTHENTICATED = 'PAYMENT_AUTHENTICATED',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED = 'PAYMENT_CAPTURED',
  PAYMENT_VOIDED = 'PAYMENT_VOIDED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED'
}

export interface PaymentEventData {
  payment: Payment;
  operations?: Operation[];
}

export interface PaymentEvent {
  eventType: PaymentEventType;
  paymentId: string;
  timestamp: string;
  data: PaymentEventData;
  metadata?: Record<string, any>;
}
