import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsNumber()
  @IsOptional()
  totalTaxAmount?: number;

  @IsEnum(OrderLineType)
  @IsOptional()
  type?: OrderLineType;
}

export class AuthorizationData {
  @IsString()
  @IsOptional()
  avsResult?: string;

  @IsString()
  @IsOptional()
  authCode?: string;

  @IsString()
  @IsOptional()
  responseMessage?: string;

  @IsString()
  @IsOptional()
  merchantAdviceCode?: string;

  @IsString()
  @IsOptional()
  retrievalReferenceNumber?: string;

  @IsString()
  @IsOptional()
  networkResponseCode?: string;

  @IsString()
  @IsOptional()
  acquirerReference?: string;

  @IsString()
  @IsOptional()
  cvvResult?: string;
}

