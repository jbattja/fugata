import { IsOptional, IsString, IsObject, IsBoolean, IsNumber, IsDate } from "class-validator";
import { PaymentMethod } from "@fugata/shared";

export class StripePaymentMethod {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  object: string;

  @IsString()
  @IsOptional()
  allow_redisplay: string;

  @IsObject()
  @IsOptional()
  billing_details: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };

  @IsDate()
  @IsOptional()
  created: Date;

  @IsString()
  @IsOptional()
  customer: string;

  @IsBoolean()
  @IsOptional()
  livemode: boolean;

  @IsObject()
  @IsOptional()
  metadata: Record<string, string>;

  @IsString()
  @IsOptional()
  redaction: string;

  // Type-specific properties
  @IsObject()
  @IsOptional()
  card?: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string | null;
    };
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    generated_from: string | null;
    last4: string;
    networks: {
      available: string[];
      preferred: string | null;
    };
    three_d_secure_usage: {
      supported: boolean;
    };
    wallet: string | null;
  };

  @IsObject()
  @IsOptional()
  us_bank_account?: {
    account_holder_type: string;
    account_type: string;
    bank_name: string;
    financial_connections_account: string | null;
    fingerprint: string;
    last4: string;
    networks: {
      preferred: string;
      supported: string[];
    };
    routing_number: string;
    status_details: Record<string, any>;
  };

  @IsObject()
  @IsOptional()
  ideal?: { 
    bank: string; 
  }
}

  class StripePaymentMethodMap {
    stripeMethod: string;
    paymentMethod: PaymentMethod;
  }

  export function getStripePaymentMethod(paymentMethod: PaymentMethod): string {
    return StripePaymentMethods.find(method => method.paymentMethod === paymentMethod).stripeMethod;
  }

  export function getPaymentMethod(stripeMethod: string): PaymentMethod {
      return StripePaymentMethods.find(method => method.stripeMethod === stripeMethod).paymentMethod;
  }
  
  const StripePaymentMethods: StripePaymentMethodMap[] = [
    {stripeMethod: 'acss_debit', paymentMethod: PaymentMethod.ACSS_DIRECT_DEBIT}, // Pre-authorized debit payments for Canadian bank accounts
    {stripeMethod: 'affirm', paymentMethod: PaymentMethod.AFFIRM}, // Buy now, pay later in the US
    {stripeMethod: 'afterpay_clearpay', paymentMethod: PaymentMethod.AFTERPAY}, // Buy now, pay later in multiple countries
    {stripeMethod: 'afterpay_clearpay', paymentMethod: PaymentMethod.CLEARPAY}, // Buy now, pay later in multiple countries
    {stripeMethod: 'alipay', paymentMethod: PaymentMethod.ALIPAY}, // Digital wallet payment method used in China
    {stripeMethod: 'alma', paymentMethod: PaymentMethod.ALMA}, // Buy Now, Pay Later in installments
    {stripeMethod: 'amazon_pay', paymentMethod: PaymentMethod.AMAZON_PAY}, // Amazon's payment method
    {stripeMethod: 'au_becs_debit', paymentMethod: PaymentMethod.BECS_DIRECT_DEBIT}, // BECS Direct Debit for Australian bank accounts
    {stripeMethod: 'bacs_debit', paymentMethod: PaymentMethod.BACS_DIRECT_DEBIT}, // Bacs Direct Debit for UK bank accounts
    {stripeMethod: 'bancontact', paymentMethod: PaymentMethod.BANCONTACT}, // Bank redirect payment method used in Belgium
    {stripeMethod: 'billie', paymentMethod: PaymentMethod.BILLIE}, // Payment method
    {stripeMethod: 'blik', paymentMethod: PaymentMethod.BLIK}, // Mobile payment method
    {stripeMethod: 'boleto', paymentMethod: PaymentMethod.BOLETO}, // Brazilian payment method
    {stripeMethod: 'card', paymentMethod: PaymentMethod.CARD}, // Credit/debit card payments
    {stripeMethod: 'card_present', paymentMethod: PaymentMethod.CARD}, // In-person card payments
    {stripeMethod: 'cashapp', paymentMethod: PaymentMethod.CASHAPP}, // Cash App payments
    {stripeMethod: 'eps', paymentMethod: PaymentMethod.EPS}, // Austrian payment method
    {stripeMethod: 'fpx', paymentMethod: PaymentMethod.FPX}, // Malaysian payment method
    {stripeMethod: 'giropay', paymentMethod: PaymentMethod.GIROPAY}, // German payment method
    {stripeMethod: 'grabpay', paymentMethod: PaymentMethod.GRABPAY}, // Southeast Asian payment method
    {stripeMethod: 'ideal', paymentMethod: PaymentMethod.IDEAL}, // Dutch payment method
    {stripeMethod: 'interac_present', paymentMethod: PaymentMethod.INTERAC}, // Canadian in-person payments
    {stripeMethod: 'kakao_pay', paymentMethod: PaymentMethod.KAKAO_PAY}, // Korean payment method
    {stripeMethod: 'klarna', paymentMethod: PaymentMethod.KLARNA}, // Buy now, pay later
    {stripeMethod: 'konbini', paymentMethod: PaymentMethod.KONBINI}, // Japanese convenience store payments
    {stripeMethod: 'mobilepay', paymentMethod: PaymentMethod.MOBILEPAY}, // Nordic payment method
    {stripeMethod: 'multibanco', paymentMethod: PaymentMethod.MULTIBANCO}, // Portuguese payment method
    {stripeMethod: 'naver_pay', paymentMethod: PaymentMethod.NAVER_PAY}, // Korean payment method
    {stripeMethod: 'oxxo', paymentMethod: PaymentMethod.OXXO}, // Mexican payment method
    {stripeMethod: 'p24', paymentMethod: PaymentMethod.P24}, // Polish payment method
    {stripeMethod: 'payco', paymentMethod: PaymentMethod.PAYCO}, // Korean payment method
    {stripeMethod: 'paynow', paymentMethod: PaymentMethod.PAYNOW}, // Singaporean payment method
    {stripeMethod: 'paypal', paymentMethod: PaymentMethod.PAYPAL}, // PayPal payments
    {stripeMethod: 'pix', paymentMethod: PaymentMethod.PIX}, // Brazilian instant payment method
    {stripeMethod: 'promptpay', paymentMethod: PaymentMethod.PROMPTPAY}, // Thai payment method
    {stripeMethod: 'samsung_pay', paymentMethod: PaymentMethod.SAMSUNG_PAY}, // Samsung's payment method
    {stripeMethod: 'satispay', paymentMethod: PaymentMethod.SATISPAY}, // Italian payment method
    {stripeMethod: 'sepa_debit', paymentMethod: PaymentMethod.SEPA_DIRECT_DEBIT}, // SEPA Direct Debit
    {stripeMethod: 'sofort', paymentMethod: PaymentMethod.SOFORT}, // European payment method
    {stripeMethod: 'swish', paymentMethod: PaymentMethod.SWISH}, // Swedish payment method
    {stripeMethod: 'twint', paymentMethod: PaymentMethod.TWINT}, // Swiss payment method
    {stripeMethod: 'unionpay', paymentMethod: PaymentMethod.CUP}, // China UnionPay
    {stripeMethod: 'wechat_pay', paymentMethod: PaymentMethod.WECHAT_PAY}, // Chinese payment method
    {stripeMethod: 'zip', paymentMethod: PaymentMethod.ZIP} // Buy now, pay later
  ]