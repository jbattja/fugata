import { IsEnum } from "class-validator";

export enum CaptureMethod {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL'
}

export enum RecurringUsage {
  NONE = 'NONE',
  CUSTOMER_INITIATED = 'CUSTOMER_INITIATED',
  MERCHANT_INITIATED_SCHEDULED = 'MERCHANT_INITIATED_SCHEDULED',
  MERCHANT_INITIATED_UNSCHEDULED = 'MERCHANT_INITIATED_UNSCHEDULED'
}

export enum PaymentFlow {
  PAY = 'PAY',
  RECURRING = 'RECURRING',
  TOKENIZE = 'TOKENIZE',
  MOTO = 'MOTO',
  REUASABLE_PAYMENT_CODE = 'REUASABLE_PAYMENT_CODE'
}

export class PaymentType {
  @IsEnum(RecurringUsage)
  recurringUsage: RecurringUsage = RecurringUsage.NONE;
  @IsEnum(PaymentFlow)
  paymentFlow: PaymentFlow = PaymentFlow.PAY;
} 

export enum OrderLineType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SHIPPING_FEE = 'SHIPPING_FEE',
  DISCOUNT = 'DISCOUNT'
}

export class OrderLine {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  totalAmount: number;
  totalTaxAmount: number;
  type: OrderLineType;
}

export class AuthorizationData {
  avsResult: string;
  authCode: string;
  responseMessage: string;
  merchantAdviceCode: string;
  retrievalReferenceNumber: string;
  networkResponseCode: string;
  acquirerReference: string;
  cvvResult: string;
}

