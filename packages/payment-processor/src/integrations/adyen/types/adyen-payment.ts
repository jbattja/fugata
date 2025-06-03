import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { TranformerError } from 'src/payment/routing/transformer';
import { v4 as uuidv4 } from 'uuid';
export enum AdyenPaymentResultCode {
  AUTHENTICATION_FINISHED = 'AuthenticationFinished',
  AUTHENTICATION_NOT_REQUIRED = 'AuthenticationNotRequired',
  AUTHORISED = 'Authorised',
  CANCELLED = 'Cancelled',
  CHALLENGE_SHOPPER = 'ChallengeShopper',
  ERROR = 'Error',
  IDENTIFY_SHOPPER = 'IdentifyShopper',
  PARTIALLY_AUTHORISED = 'PartiallyAuthorised',
  PENDING = 'Pending',
  PRESENT_TO_SHOPPER = 'PresentToShopper',
  RECEIVED = 'Received',
  REDIRECT_SHOPPER = 'RedirectShopper',
  REFUSED = 'Refused'
}

export enum AdyenActionMethod {
  GET = 'GET',
  POST = 'POST'
}

export enum AdyenActionType {
  REDIRECT = 'redirect',
}

export class AdyenShopper {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export class AdyenAmount {
  @IsNumber()
  value: number;

  @IsString()
  currency: string;

  constructor(value: number, currency: string) {
    this.value = value;
    this.currency = currency;
  }
}

export class AdyenPaymentMethod {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  encryptedCardNumber?: string;

  @IsOptional()
  @IsString()
  encryptedExpiryMonth?: string;

  @IsOptional()
  @IsString()
  encryptedExpiryYear?: string;

  @IsOptional()
  @IsString()
  encryptedSecurityCode?: string;

  @IsOptional()
  @IsString()
  holderName?: string;
}

export class AdyenPaymentRequest {
  @ValidateNested()
  @Type(() => AdyenAmount)
  amount: AdyenAmount;

  @IsString()
  merchantAccount: string;

  @IsString()
  reference: string;

  @IsString()
  returnUrl: string;

  @ValidateNested()
  @Type(() => AdyenPaymentMethod)
  paymentMethod: AdyenPaymentMethod;

  @IsOptional()
  @IsString()
  shopperReference?: string;

  @IsOptional()
  @IsString()
  shopperEmail?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdyenShopper)
  shopperName?: AdyenShopper;

  @IsOptional()
  @IsString()
  shopperLocale?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  constructor(partial: Partial<AdyenPaymentRequest>) {
    Object.assign(this, partial);
  }
}

export class AdyenAction {

  @IsObject()
  data: Record<string, any>;

  @IsEnum(AdyenActionType)
  type: AdyenActionType;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => AdyenPaymentMethod)
  paymentMethodType: AdyenPaymentMethod;

  @IsEnum(AdyenActionMethod)
  method: AdyenActionMethod;
}

export class AdyenPaymentResponse {
  @IsString()
  pspReference: string;

  @IsEnum(AdyenPaymentResultCode)
  resultCode: AdyenPaymentResultCode;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdyenAction)
  action?: AdyenAction;

  @IsOptional()
  @IsString()
  refusalReason?: string;

  @IsOptional()
  @IsString()
  refusalReasonCode?: string;

  @IsOptional()
  @IsString()
  paymentData?: string;

  @IsOptional()
  @IsString()
  merchantReference?: string;

  @IsOptional()
  additionalData?: Record<string, any>;

  constructor(partial: Partial<AdyenPaymentResponse>) {
    Object.assign(this, partial);
  }
}

export class AdyenPaymentRequestBuilder {
  private paymentRequest: Partial<AdyenPaymentRequest> = {};

  withAmount(amount: AdyenAmount): AdyenPaymentRequestBuilder {
    this.paymentRequest.amount = amount;
    return this;
  }

  withMerchantAccount(merchantAccount: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.merchantAccount = merchantAccount;
    return this;
  }

  withReference(reference: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.reference = reference;
    return this;
  }

  withReturnUrl(returnUrl: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.returnUrl = returnUrl;
    return this;
  }

  withPaymentMethod(paymentMethod: AdyenPaymentMethod): AdyenPaymentRequestBuilder {
    this.paymentRequest.paymentMethod = paymentMethod;
    return this;
  }

  withShopperReference(shopperReference?: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.shopperReference = shopperReference;
    return this;
  }

  withShopperName(shopperName?: AdyenShopper): AdyenPaymentRequestBuilder {
    this.paymentRequest.shopperName = shopperName;
    return this;
  }

  withShopperEmail(shopperEmail?: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.shopperEmail = shopperEmail;
    return this;
  }

  withShopperLocale(shopperLocale?: string): AdyenPaymentRequestBuilder {
    this.paymentRequest.shopperLocale = shopperLocale;
    return this;
  }

  withMetadata(metadata?: Record<string, any>): AdyenPaymentRequestBuilder {
    this.paymentRequest.metadata = metadata;
    return this;
  }

  build(): AdyenPaymentRequest {
    const requiredFields = ['amount', 'merchantAccount', 'reference', 'returnUrl', 'paymentMethod'];
    if (!this.paymentRequest.reference) {
      this.paymentRequest.reference = uuidv4();
    }
    const missingFields = requiredFields.filter(field => !this.paymentRequest[field]);
    if (missingFields.length > 0) {
      throw new TranformerError(`Required fields are missing for Adyen Payment Request: ${missingFields.join(', ')}`);
    }

    return new AdyenPaymentRequest(
      this.paymentRequest
    );
  }
}

export class AdyenPaymentResponseBuilder {
  private paymentResponse: Partial<AdyenPaymentResponse> = {};

  withPspReference(pspReference: string): AdyenPaymentResponseBuilder {
    this.paymentResponse.pspReference = pspReference;
    return this;
  }

  withResultCode(resultCode: AdyenPaymentResultCode): AdyenPaymentResponseBuilder {
    this.paymentResponse.resultCode = resultCode;
    return this;
  }

  withAction(action?: AdyenAction): AdyenPaymentResponseBuilder {
    this.paymentResponse.action = action;
    return this;
  }

  withRefusalReason(refusalReason?: string): AdyenPaymentResponseBuilder {
    this.paymentResponse.refusalReason = refusalReason;
    return this;
  }

  withRefusalReasonCode(refusalReasonCode?: string): AdyenPaymentResponseBuilder {
    this.paymentResponse.refusalReasonCode = refusalReasonCode;
    return this;
  }

  withPaymentData(paymentData?: string): AdyenPaymentResponseBuilder {
    this.paymentResponse.paymentData = paymentData;
    return this;
  }

  withMerchantReference(merchantReference?: string): AdyenPaymentResponseBuilder {
    this.paymentResponse.merchantReference = merchantReference;
    return this;
  }

  withAdditionalData(additionalData?: Record<string, any>): AdyenPaymentResponseBuilder {
    this.paymentResponse.additionalData = additionalData;
    return this;
  }

  build(): AdyenPaymentResponse {
    const requiredFields = ['pspReference', 'resultCode'];
    const missingFields = requiredFields.filter(field => !this.paymentResponse[field]);
    if (missingFields.length > 0) {
      throw new TranformerError(`Required fields are missing for Adyen Payment Response: ${missingFields.join(', ')}`);
    }
    return new AdyenPaymentResponse(
      this.paymentResponse
    );
  }
} 