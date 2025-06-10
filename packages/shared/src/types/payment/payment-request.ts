import { IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '././payment-method';
import { Amount } from './amount';
import { PaymentStatus } from './payment-status';
import { Customer } from './customer';
import { FugataReference } from './fugata-reference';
import { CaptureMethod } from './payment-common';

export enum PaymentRequestNextActionType {
  REDIRECT_TO_URL = 'redirect_to_url',
}

export class PaymentRequestNextAction {
  @IsEnum(PaymentRequestNextActionType)
  type: PaymentRequestNextActionType;

  @IsString()
  url: string;
}

export class PaymentRequest {

  @IsString()
  @IsOptional()
  id?: string;

  @ValidateNested()
  @Type(() => Amount)
  @IsOptional()
  amount?: Amount;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @ValidateNested()
  @Type(() => Customer)
  @IsOptional()
  customer?: Customer;

  @IsEnum(CaptureMethod)
  @IsOptional()
  captureMethod?: CaptureMethod;
  
  @IsOptional()
  @IsString()
  providerCredentialCode?: string;

  @IsOptional()
  @IsString()
  providerCode?: string;

  @IsOptional()
  @IsString()
  merchantCode?: string;

  @IsString()
  @IsOptional()
  providerReference?: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  failureReason?: string;

  @IsDate()
  @IsOptional()
  created?: Date;

  @IsString()
  @IsOptional()
  nextActionDetails?: PaymentRequestNextAction;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  fugataReference?: string;

  constructor(partial: Partial<PaymentRequest>) {
    Object.assign(this, partial);
  }
}

export class PaymentRequestBuilder {
  private paymentRequest: Partial<PaymentRequest> = {};

  withId(id: string): PaymentRequestBuilder {
    this.paymentRequest.id = id;
    return this;
  }

  withAmount(amount: Amount): PaymentRequestBuilder {
    this.paymentRequest.amount = amount;
    return this;
  }

  withMethod(method: PaymentMethod): PaymentRequestBuilder {
    this.paymentRequest.paymentMethod = method;
    return this;
  }

  withReference(reference: string): PaymentRequestBuilder {
    this.paymentRequest.reference = reference;
    return this;
  }

  withDescription(description?: string): PaymentRequestBuilder {
    this.paymentRequest.description = description;
    return this;
  }

  withReturnUrl(returnUrl?: string): PaymentRequestBuilder {
    this.paymentRequest.returnUrl = returnUrl;
    return this;
  }

  withCustomer(customer?: Customer): PaymentRequestBuilder {
    this.paymentRequest.customer = customer;
    return this;
  }

  withCaptureMethod(captureMethod?: CaptureMethod): PaymentRequestBuilder {
    this.paymentRequest.captureMethod = captureMethod;
    return this;
  }

  withProviderCredentialCode(providerCredentialCode?: string): PaymentRequestBuilder {
    this.paymentRequest.providerCredentialCode = providerCredentialCode;
    return this;
  }

  withProviderCode(providerCode?: string): PaymentRequestBuilder {
    this.paymentRequest.providerCode = providerCode;
    return this;
  }

  withMerchantCode(merchantCode?: string): PaymentRequestBuilder {
    this.paymentRequest.merchantCode = merchantCode;
    return this;
  }

  withProviderReference(providerReference?: string): PaymentRequestBuilder {
    this.paymentRequest.providerReference = providerReference;
    return this;
  }

  withStatus(status?: PaymentStatus): PaymentRequestBuilder {
    this.paymentRequest.status = status;
    return this;
  }

  withFailureReason(failureReason?: string): PaymentRequestBuilder {
    this.paymentRequest.failureReason = failureReason;
    return this;
  }

  withCreated(created?: Date): PaymentRequestBuilder {
    this.paymentRequest.created = created;
    return this;
  }

  withNextActionDetails(nextActionDetails?: PaymentRequestNextAction): PaymentRequestBuilder {
    this.paymentRequest.nextActionDetails = nextActionDetails;
    return this;
  }

  withMetadata(metadata?: Record<string, any>): PaymentRequestBuilder {
    this.paymentRequest.metadata = metadata;
    return this;
  }

  withFugataReference(fugataReference?: string): PaymentRequestBuilder {
    this.paymentRequest.fugataReference = fugataReference;
    return this;
  }

  build(): PaymentRequest {
    if (!this.paymentRequest.fugataReference) {
      this.paymentRequest.fugataReference = FugataReference.generateReference();
    }
    return new PaymentRequest(
      this.paymentRequest
    );
  }
} 