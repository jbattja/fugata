import { Injectable } from '@nestjs/common';
import { Currency, Amount, PaymentMethod, PaymentRequest, PaymentRequestBuilder, PaymentRequestNextAction, PaymentRequestNextActionType, PaymentRequestStatus } from '@fugata/shared';
import { PaymentRequestTransformer, PaymentResponseTransformer, ProviderTransformer } from '../../payment/routing/transformer';
import { 
  AdyenPaymentRequest, 
  AdyenPaymentResponse, 
  AdyenPaymentRequestBuilder,
  AdyenPaymentResponseBuilder,
  AdyenAmount,
  AdyenPaymentMethod,
  AdyenPaymentResultCode,
  AdyenAction,
  AdyenActionType,
  AdyenActionMethod,
  AdyenShopper
} from './types/adyen-payment';
import { PaymentConnector } from '../../payment/routing/transformer';
import { getAdyenPaymentMethod, getPaymentMethod } from './types/adyen-payment-method';
import { AdyenConnector } from './adyen-connector';
import { CustomerBuilder } from '@fugata/shared';

@Injectable()
export class AdyenService extends ProviderTransformer<AdyenPaymentRequest, AdyenPaymentResponse> {
  readonly providerCode = 'adyen';
  private payments: Map<string, AdyenPaymentResponse> = new Map();

  readonly requestTransformer: PaymentRequestTransformer<AdyenPaymentRequest> = {
    toPaymentRequest: (source: AdyenPaymentRequest): PaymentRequest => {
      const paymentRequest = new PaymentRequestBuilder()
        .withAmount(this.mapAdyenAmountToAmount(source.amount))
        .withMethod(this.mapAdyenMethodToPaymentMethod(source.paymentMethod))
        .withReference(source.reference)
        .withReturnUrl(source.returnUrl)
        .withMetadata(source.metadata)
        .build();
      let customerName = null;
      if (source.shopperName && source.shopperName.firstName && source.shopperName.lastName) {
        customerName = source.shopperName.firstName + " " + source.shopperName.lastName;
      }
      if (source.shopperReference || customerName || source.shopperEmail || source.shopperLocale) {
        const customer = new CustomerBuilder()
          .withId(source.shopperReference)
          .withCustomerName(customerName)
          .withCustomerEmail(source.shopperEmail)
          .withCustomerLocale(source.shopperLocale)
          .build();
        paymentRequest.customer = customer;
      }
      return paymentRequest;
    },
    fromPaymentRequest: (source: PaymentRequest): AdyenPaymentRequest => {
      const adyenSettings = this.getProviderCredentials().settings;

      const adyenRequest =  new AdyenPaymentRequestBuilder()
        .withAmount(this.mapAmountToAdyenAmount(source.amount))
        .withMerchantAccount(adyenSettings.merchantAccount)
        .withReference(source.reference)
        .withReturnUrl(source.returnUrl)
        .withPaymentMethod(this.mapPaymentMethodToAdyenMethod(source.paymentMethod))
        .withMetadata(source.metadata)
        .build();
        if (source.customer) {
          adyenRequest.shopperReference = source.customer.id;
          adyenRequest.shopperEmail = source.customer.customerEmail;
          adyenRequest.shopperLocale = source.customer.customerLocale;
          const shopperName = source.customer.customerName.split(' ');
          if (shopperName.length === 2) {
            adyenRequest.shopperName = new AdyenShopper(shopperName[0], shopperName[1]);
          }
        }
        return adyenRequest;
    },
    updateCredentials: (source: AdyenPaymentRequest): AdyenPaymentRequest => {
      source.merchantAccount = this.getProviderCredentials().settings.merchantAccount;
      return source;
    }
  };

  readonly responseTransformer: PaymentResponseTransformer<AdyenPaymentRequest, AdyenPaymentResponse> = {
    toPaymentResponse: (source: AdyenPaymentResponse): PaymentRequest => {
      return new PaymentRequestBuilder()
        .withReference(source.pspReference)
        .withProviderReference(source.pspReference)
        .withStatus(this.mapAdyenResultCodeToStatus(source.resultCode))
        .withMetadata(source.additionalData)
        .withNextActionDetails(this.mapAdyenNextActionToPaymentRequestNextAction(source.action))
        .withFailureReason(source.refusalReason)
        .build();
    },
    fromPaymentResponse: (source: PaymentRequest): AdyenPaymentResponse => {
      return new AdyenPaymentResponseBuilder()
        .withPspReference(source.providerReference)
        .withResultCode(this.mapPaymentStatusToAdyenResultCode(source.status))
        .withRefusalReason(source.failureReason)
        .withAdditionalData(source.metadata)
        .withAction(this.mapPaymentRequestNextActionToAdyenNextAction(source))
        .build();
    },
    updateCredentials: (source: AdyenPaymentResponse): AdyenPaymentResponse => {
      return source;
    }
  };

  readonly connector: PaymentConnector<AdyenPaymentRequest, AdyenPaymentResponse> = {
    sendPayment: async (request: AdyenPaymentRequest): Promise<AdyenPaymentResponse> => {
      const adyenSettings = this.getProviderCredentials().settings;
      return AdyenConnector.createPayment(request, adyenSettings.apiKey);
    }
  };

  async getPayment(pspReference: string): Promise<AdyenPaymentResponse> {
    const payment = this.payments.get(pspReference);
    if (!payment) {
      throw new Error(`Payment ${pspReference} not found`);
    }
    return payment;
  }

  private mapAdyenResultCodeToStatus(resultCode: AdyenPaymentResultCode): PaymentRequestStatus {
    switch (resultCode) {
      case AdyenPaymentResultCode.AUTHENTICATION_FINISHED:
        return PaymentRequestStatus.REQUIRES_ACTION;
      case AdyenPaymentResultCode.AUTHENTICATION_NOT_REQUIRED:
        return PaymentRequestStatus.SUCCEEDED;
      case AdyenPaymentResultCode.AUTHORISED:
        return PaymentRequestStatus.SUCCEEDED;
        case AdyenPaymentResultCode.CANCELLED:
          return PaymentRequestStatus.CANCELED;
      case AdyenPaymentResultCode.CHALLENGE_SHOPPER:
        return PaymentRequestStatus.REQUIRES_ACTION;
      case AdyenPaymentResultCode.ERROR:
        return PaymentRequestStatus.PENDING;
      case AdyenPaymentResultCode.IDENTIFY_SHOPPER:
        return PaymentRequestStatus.AWAITING_CONFIRMATION;
      case AdyenPaymentResultCode.PARTIALLY_AUTHORISED:
        return PaymentRequestStatus.AWAITING_CAPTURE;
      case AdyenPaymentResultCode.PENDING:
        return PaymentRequestStatus.PENDING;
      case AdyenPaymentResultCode.PRESENT_TO_SHOPPER:
        return PaymentRequestStatus.REQUIRES_ACTION; 
      case AdyenPaymentResultCode.RECEIVED:
        return PaymentRequestStatus.PENDING;
      case AdyenPaymentResultCode.REDIRECT_SHOPPER:
        return PaymentRequestStatus.REQUIRES_ACTION;
      case AdyenPaymentResultCode.REFUSED:
        return PaymentRequestStatus.FAILED;
      default:
        return PaymentRequestStatus.PENDING;
    }
  }

  private mapPaymentStatusToAdyenResultCode(status: PaymentRequestStatus): AdyenPaymentResultCode {
    switch (status) {
      case PaymentRequestStatus.SUCCEEDED:
        return AdyenPaymentResultCode.AUTHORISED;
      case PaymentRequestStatus.FAILED:
        return AdyenPaymentResultCode.REFUSED;
      case PaymentRequestStatus.PENDING:
        return AdyenPaymentResultCode.PENDING;
      case PaymentRequestStatus.CANCELED:
        return AdyenPaymentResultCode.CANCELLED;
      case PaymentRequestStatus.AWAITING_CONFIRMATION:
        return AdyenPaymentResultCode.IDENTIFY_SHOPPER;
      case PaymentRequestStatus.AWAITING_CAPTURE:
        return AdyenPaymentResultCode.AUTHORISED;
      case PaymentRequestStatus.REQUIRES_ACTION:
        return AdyenPaymentResultCode.PRESENT_TO_SHOPPER;
      case PaymentRequestStatus.AWAITING_PAYMENT_METHOD:
        return AdyenPaymentResultCode.PRESENT_TO_SHOPPER;
      default:
        return AdyenPaymentResultCode.PENDING;
    }
  }

  // Both uses minor units
  private mapAdyenAmountToAmount(adyenAmount: AdyenAmount): Amount {
    return new Amount(adyenAmount.value, adyenAmount.currency.toUpperCase() as Currency);
  }

  // Both uses minor units
  private mapAmountToAdyenAmount(amount: Amount): AdyenAmount {
    return new AdyenAmount(amount.value, amount.currency);
  }

  private mapAdyenMethodToPaymentMethod(adyenMethod: AdyenPaymentMethod): PaymentMethod {
    return getPaymentMethod(adyenMethod.type);
  }

  private mapPaymentMethodToAdyenMethod(paymentMethod: PaymentMethod): AdyenPaymentMethod {
    if (!paymentMethod) {
      return null;
    }
    const adyenMethod = new AdyenPaymentMethod();
    adyenMethod.type = getAdyenPaymentMethod(paymentMethod);
    return adyenMethod;
  }

  private mapAdyenNextActionToPaymentRequestNextAction(nextAction: AdyenAction): PaymentRequestNextAction {
    if (!nextAction) {
      return null;
    }
    if (nextAction.type === AdyenActionType.REDIRECT) {
      const paymentRequestNextAction = new PaymentRequestNextAction();
      paymentRequestNextAction.type = PaymentRequestNextActionType.REDIRECT_TO_URL;
      paymentRequestNextAction.url = nextAction.url;
      return paymentRequestNextAction;
    }
    return null;
  }

  private mapPaymentRequestNextActionToAdyenNextAction(paymentRequest: PaymentRequest): AdyenAction {
    if (!paymentRequest.nextActionDetails) {
      return null;
    }
    if (paymentRequest.nextActionDetails.type === PaymentRequestNextActionType.REDIRECT_TO_URL) {
      const adyenNextAction = new AdyenAction();
      adyenNextAction.type = AdyenActionType.REDIRECT;
      adyenNextAction.url = paymentRequest.nextActionDetails.url;
      adyenNextAction.method = AdyenActionMethod.GET;
      adyenNextAction.paymentMethodType = this.mapPaymentMethodToAdyenMethod(paymentRequest.paymentMethod);
      return adyenNextAction;
    }
    return null;
  }
}