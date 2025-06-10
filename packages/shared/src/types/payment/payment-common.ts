
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
  recurringUsage: RecurringUsage;
  paymentFlow: PaymentFlow;
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

