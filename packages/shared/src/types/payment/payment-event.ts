import { Payment } from './payment';

export enum PaymentEventType {
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAYMENT_AUTHENTICATED = 'PAYMENT_AUTHENTICATED',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED = 'PAYMENT_CAPTURED',
  PAYMENT_VOIDED = 'PAYMENT_VOIDED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED'
}

export interface PaymentEvent {
  eventType: PaymentEventType;
  paymentId: string;
  timestamp: string;
  data: Payment;
  metadata?: Record<string, any>;
}
