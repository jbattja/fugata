import { IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MissingFieldsError } from 'src/partner-communication/exceptions/missing-fields-error.filter';

export enum StripePaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  REQUIRES_CAPTURE = 'requires_capture',
  CANCELED = 'canceled',
  SUCCEEDED = 'succeeded'
}

export enum StripeCaptureMethod {
  AUTOMATIC = 'automatic',
  AUTOMATIC_ASYNC = 'automatic_async',
  MANUAL = 'manual'
}

export enum StripeConfirmationMethod {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual'
}

export class StripeAmountDetails {
  @IsOptional()
  @IsNumber()
  tip?: number;
}

export class StripeAutomaticPaymentMethods {
  @IsOptional()
  enabled?: boolean;
}

export class StripePaymentMethodOptions {
  @IsOptional()
  card?: {
    installments?: any;
    mandate_options?: any;
    network?: string;
    request_three_d_secure?: string;
  };
  @IsOptional()
  link?: {
    persistent_token?: string;
  };
}

export enum StripePaymentIntentNextActionType {
  REDIRECT_TO_URL = 'redirect_to_url',
  USE_STRIPE_SDK = 'use_stripe_sdk',
  DISPLAY_OXXO_VOUCHER = 'display_oxxo_voucher',
  DISPLAY_BANK_TRANSFER_VOUCHER = 'display_bank_transfer_voucher',
}

export class StripePaymentIntentNextActionRedirectToUrl {
  @IsString()
  url: string;

  @IsString()
  return_url: string;
}

export class StripePaymentIntentNextAction {
  @IsEnum(StripePaymentIntentNextActionType)
  type?: StripePaymentIntentNextActionType;

  @IsOptional()
  @ValidateNested()
  @Type(() => StripePaymentIntentNextActionRedirectToUrl)
  redirect_to_url?: StripePaymentIntentNextActionRedirectToUrl;

  @IsOptional()
  @IsObject()
  use_stripe_sdk?: Record<string, any>;
}

export class StripePaymentIntent {
  @IsString()
  id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  amount_capturable?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StripeAmountDetails)
  amount_details?: StripeAmountDetails;

  @IsOptional()
  @IsNumber()
  amount_received?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StripeAutomaticPaymentMethods)
  automatic_payment_methods?: StripeAutomaticPaymentMethods;

  @IsOptional()
  @IsString()
  canceled_at?: string;

  @IsOptional()
  @IsString()
  cancellation_reason?: string;

  @IsEnum(StripeCaptureMethod)
  capture_method: StripeCaptureMethod;

  @IsString()
  @IsOptional()
  client_secret?: string;

  @IsString()
  @IsOptional()
  confirmation_method?: StripeConfirmationMethod;

  @IsNumber()
  @IsOptional()
  created?: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  last_payment_error?: Record<string, any>;

  @IsOptional()
  @IsString()
  latest_charge?: string;

  @IsOptional()
  @IsString()
  livemode?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => StripePaymentIntentNextAction)
  next_action?: StripePaymentIntentNextAction;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => StripePaymentMethodOptions)
  payment_method_options?: StripePaymentMethodOptions;

  @IsOptional()
  @IsString({ each: true })
  payment_method_types?: string[];

  @IsOptional()
  @IsString()
  receipt_email?: string;

  @IsOptional()
  @IsString()
  return_url?: string;

  @IsOptional()
  @IsString()
  setup_future_usage?: string;

  @IsEnum(StripePaymentIntentStatus)
  @IsOptional()
  status?: StripePaymentIntentStatus;

  constructor(partial: Partial<StripePaymentIntent>) {
    Object.assign(this, partial);
  }
}

export class StripePaymentIntentBuilder {
  private paymentIntent: Partial<StripePaymentIntent> = {};

  withId(id: string): StripePaymentIntentBuilder {
    this.paymentIntent.id = id;
    return this;
  }

  withAmount(amount: number): StripePaymentIntentBuilder {
    this.paymentIntent.amount = amount;
    return this;
  }

  withAmountCapturable(amountCapturable?: number): StripePaymentIntentBuilder {
    this.paymentIntent.amount_capturable = amountCapturable;
    return this;
  }

  withAmountDetails(amountDetails?: StripeAmountDetails): StripePaymentIntentBuilder {
    this.paymentIntent.amount_details = amountDetails;
    return this;
  }

  withAmountReceived(amountReceived?: number): StripePaymentIntentBuilder {
    this.paymentIntent.amount_received = amountReceived;
    return this;
  }

  withAutomaticPaymentMethods(automaticPaymentMethods?: StripeAutomaticPaymentMethods): StripePaymentIntentBuilder {
    this.paymentIntent.automatic_payment_methods = automaticPaymentMethods;
    return this;
  }

  withCanceledAt(canceledAt?: string): StripePaymentIntentBuilder {
    this.paymentIntent.canceled_at = canceledAt;
    return this;
  }

  withCancellationReason(cancellationReason?: string): StripePaymentIntentBuilder {
    this.paymentIntent.cancellation_reason = cancellationReason;
    return this;
  }

  withCaptureMethod(captureMethod: StripeCaptureMethod): StripePaymentIntentBuilder {
    this.paymentIntent.capture_method = captureMethod;
    return this;
  }

  withClientSecret(clientSecret: string): StripePaymentIntentBuilder {
    this.paymentIntent.client_secret = clientSecret;
    return this;
  }

  withConfirmationMethod(confirmationMethod: StripeConfirmationMethod): StripePaymentIntentBuilder {
    this.paymentIntent.confirmation_method = confirmationMethod;
    return this;
  }

  withCreated(created: number): StripePaymentIntentBuilder {
    this.paymentIntent.created = created;
    return this;
  }

  withCurrency(currency: string): StripePaymentIntentBuilder {
    this.paymentIntent.currency = currency;
    return this;
  }

  withCustomer(customer?: string): StripePaymentIntentBuilder {
    this.paymentIntent.customer = customer;
    return this;
  }

  withDescription(description?: string): StripePaymentIntentBuilder {
    this.paymentIntent.description = description;
    return this;
  }

  withLastPaymentError(lastPaymentError?: Record<string, any>): StripePaymentIntentBuilder {
    this.paymentIntent.last_payment_error = lastPaymentError;
    return this;
  }

  withLatestCharge(latestCharge?: string): StripePaymentIntentBuilder {
    this.paymentIntent.latest_charge = latestCharge;
    return this;
  }

  withLivemode(livemode?: string): StripePaymentIntentBuilder {
    this.paymentIntent.livemode = livemode;
    return this;
  }

  withMetadata(metadata?: Record<string, any>): StripePaymentIntentBuilder {
    this.paymentIntent.metadata = metadata;
    return this;
  }

  withNextAction(nextAction?: StripePaymentIntentNextAction): StripePaymentIntentBuilder {
    this.paymentIntent.next_action = nextAction;
    return this;
  }

  withPaymentMethod(paymentMethod?: string): StripePaymentIntentBuilder {
    this.paymentIntent.payment_method = paymentMethod;
    return this;
  }

  withPaymentMethodOptions(paymentMethodOptions?: StripePaymentMethodOptions): StripePaymentIntentBuilder {
    this.paymentIntent.payment_method_options = paymentMethodOptions;
    return this;
  }

  withPaymentMethodTypes(paymentMethodTypes?: string[]): StripePaymentIntentBuilder {
    this.paymentIntent.payment_method_types = paymentMethodTypes;
    return this;
  }

  withReceiptEmail(receiptEmail?: string): StripePaymentIntentBuilder {
    this.paymentIntent.receipt_email = receiptEmail;
    return this;
  }

  withReturnUrl(returnUrl?: string): StripePaymentIntentBuilder {
    this.paymentIntent.return_url = returnUrl;
    return this;
  }

  withSetupFutureUsage(setupFutureUsage?: string): StripePaymentIntentBuilder {
    this.paymentIntent.setup_future_usage = setupFutureUsage;
    return this;
  }

  withStatus(status: StripePaymentIntentStatus): StripePaymentIntentBuilder {
    this.paymentIntent.status = status;
    return this;
  }

  build(): StripePaymentIntent {
    const requiredFields = ['amount', 'currency'];
    const missingFields = requiredFields.filter(field => !this.paymentIntent[field]);
    if (missingFields.length > 0) {
      throw new MissingFieldsError(`Required fields are missing for Stripe Payment Intent: ${missingFields.join(', ')}`);
    }
    return new StripePaymentIntent(this.paymentIntent);
  }
} 