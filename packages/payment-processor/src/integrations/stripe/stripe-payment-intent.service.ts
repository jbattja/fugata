import { Injectable } from '@nestjs/common';
import { StripePaymentIntent, StripePaymentIntentStatus, StripeCaptureMethod, StripeConfirmationMethod, StripePaymentIntentNextAction, StripePaymentIntentNextActionType } from './types/stripe-payment-intent';
import { PaymentRequest, Amount, CaptureMethod, PaymentRequestBuilder, PaymentRequestStatus, Currency, PaymentRequestNextAction, PaymentRequestNextActionType, PaymentMethod, CustomerBuilder } from '@fugata/shared';
import { ProviderTransformer, PaymentRequestTransformer, PaymentResponseTransformer, PaymentConnector, PaymentRequestContext } from '../../payment/routing/transformer';
import { StripePaymentIntentBuilder } from './types/stripe-payment-intent';
import { StripeConnector } from './stripe.connector';
import { getStripePaymentMethod, getPaymentMethod, StripePaymentMethod } from './types/stripe-payment-method';
@Injectable()
export class StripePaymentIntentService extends ProviderTransformer<StripePaymentIntent, StripePaymentIntent> {
  readonly providerCode = 'stripe';
  private paymentIntents: Map<string, StripePaymentIntent> = new Map();

  readonly requestTransformer: PaymentRequestTransformer<StripePaymentIntent> = {
    toPaymentRequest: (source: StripePaymentIntent): PaymentRequest => {
      const paymentRequest = new PaymentRequestBuilder()
        .withAmount(this.mapStripeAmountToAmount(source.amount, source.currency))
        .withStatus(this.mapStripeStatusToPaymentStatus(source.status))
        .withCaptureMethod(this.mapStripeCaptureMethodToCaptureMethod(source.capture_method))
        .withDescription(source.description)
        .withMetadata(source.metadata)
        .withNextActionDetails(this.mapStripeNextActionToPaymentRequestNextAction(source.next_action))
        .withReturnUrl(source.return_url)
        .build();
      if (source.customer) {
        paymentRequest.customer = new CustomerBuilder()
          .withId(source.customer)
          .build();
      }
      return paymentRequest;
    },
    fromPaymentRequest: (source: PaymentRequest): StripePaymentIntent => {
      const stripeIntent = new StripePaymentIntentBuilder()
        .withAmount(this.mapAmountToStripeAmount(source.amount))
        .withCurrency(source.amount.currency.toLowerCase())
        .withCaptureMethod(this.mapCaptureMethodToStripeCaptureMethod(source.captureMethod))
        .withDescription(source.description)
        .withMetadata(source.metadata)
        .withNextAction(this.mapPaymentRequestNextActionToStripeNextAction(source.nextActionDetails, source))
        .withPaymentMethodTypes([getStripePaymentMethod(source.paymentMethod)])
        .withConfirmationMethod(StripeConfirmationMethod.AUTOMATIC)
        .build();

        if (source.customer) {
          stripeIntent.customer = source.customer.id;
        }

        return stripeIntent;
    },
    updateCredentials: (source: StripePaymentIntent): StripePaymentIntent => {
      return source;
    }
  };

  readonly responseTransformer: PaymentResponseTransformer<StripePaymentIntent, StripePaymentIntent> = {
    toPaymentResponse: (source: StripePaymentIntent, context: PaymentRequestContext<StripePaymentIntent, StripePaymentIntent>): PaymentRequest => {
      const paymentRequest = this.requestTransformer.toPaymentRequest(source);
      paymentRequest.paymentMethod = context.internalRequest.paymentMethod;
      paymentRequest.providerReference = source.id;
      paymentRequest.failureReason = source.last_payment_error;
      return paymentRequest;
    },
    fromPaymentResponse: (response: PaymentRequest): StripePaymentIntent => {
      return this.requestTransformer.fromPaymentRequest(response);
    },
    updateCredentials: (source: StripePaymentIntent): StripePaymentIntent => {
      return source;
    }
  };

  readonly connector: PaymentConnector<StripePaymentIntent, StripePaymentIntent> = {
    sendPayment: async (request: StripePaymentIntent, context: PaymentRequestContext<StripePaymentIntent, StripePaymentIntent>): Promise<StripePaymentIntent> => {
      const secretKey = this.getProviderCredentials().settings.secretKey;
      return StripeConnector.createPaymentIntent(request, secretKey, context.internalRequest);
    }
  };

  async getPaymentIntent(id: string): Promise<StripePaymentIntent> {
    const paymentIntent = this.paymentIntents.get(id);
    if (!paymentIntent) {
      throw new Error(`Payment intent ${id} not found`);
    }
    return paymentIntent;
  }

  private mapStripeStatusToPaymentStatus(status: StripePaymentIntentStatus): PaymentRequestStatus {
    switch (status) {
      case StripePaymentIntentStatus.REQUIRES_PAYMENT_METHOD:
        return PaymentRequestStatus.AWAITING_PAYMENT_METHOD;
      case StripePaymentIntentStatus.REQUIRES_CONFIRMATION:
        return PaymentRequestStatus.AWAITING_CONFIRMATION;
      case StripePaymentIntentStatus.REQUIRES_ACTION:
        return PaymentRequestStatus.REQUIRES_ACTION;
      case StripePaymentIntentStatus.PROCESSING:
        return PaymentRequestStatus.PENDING;
      case StripePaymentIntentStatus.REQUIRES_CAPTURE:
        return PaymentRequestStatus.AWAITING_CAPTURE;
      case StripePaymentIntentStatus.CANCELED:
        return PaymentRequestStatus.CANCELED;
      case StripePaymentIntentStatus.SUCCEEDED:
        return PaymentRequestStatus.SUCCEEDED;
      default:
        return PaymentRequestStatus.PENDING;
    }
  }

  private mapPaymentStatusToStripeStatus(status: PaymentRequestStatus): StripePaymentIntentStatus {
    switch (status) {
      case PaymentRequestStatus.AWAITING_PAYMENT_METHOD:
        return StripePaymentIntentStatus.REQUIRES_PAYMENT_METHOD;
      case PaymentRequestStatus.AWAITING_CONFIRMATION:
        return StripePaymentIntentStatus.REQUIRES_CONFIRMATION;
      case PaymentRequestStatus.REQUIRES_ACTION:
        return StripePaymentIntentStatus.REQUIRES_ACTION;
      case PaymentRequestStatus.PENDING:
        return StripePaymentIntentStatus.PROCESSING;
      case PaymentRequestStatus.AWAITING_CAPTURE:
        return StripePaymentIntentStatus.REQUIRES_CAPTURE;
      case PaymentRequestStatus.CANCELED:
        return StripePaymentIntentStatus.CANCELED;
      case PaymentRequestStatus.SUCCEEDED:
        return StripePaymentIntentStatus.SUCCEEDED;
      default:
        return StripePaymentIntentStatus.PROCESSING;
    }
  }

  private mapStripeCaptureMethodToCaptureMethod(method: StripeCaptureMethod): CaptureMethod {
    return method === StripeCaptureMethod.MANUAL ? CaptureMethod.MANUAL : CaptureMethod.AUTOMATIC;
  }

  private mapCaptureMethodToStripeCaptureMethod(method: CaptureMethod): StripeCaptureMethod {
    return method === CaptureMethod.MANUAL ? StripeCaptureMethod.MANUAL : StripeCaptureMethod.AUTOMATIC;
  }

  // Both uses minor units
  private mapStripeAmountToAmount(amount: number, currency: string): Amount {
    return new Amount(amount, currency.toUpperCase() as Currency);
  }

    // Both uses minor units
  private mapAmountToStripeAmount(amount: Amount): number {
    return amount.value;
  }

  private mapStripeMethodToPaymentMethod(stripeMethod: string): PaymentMethod {
    return getPaymentMethod(stripeMethod);
  }

  private mapPaymentMethodToStripeMethod(paymentMethod: PaymentMethod): StripePaymentMethod {
    const stripeMethod = new StripePaymentMethod();
    
    return stripeMethod;
  }



  private mapStripeNextActionToPaymentRequestNextAction(nextAction: StripePaymentIntentNextAction): PaymentRequestNextAction {
    if (!nextAction) {
      return null;
    }
    if (nextAction.type === StripePaymentIntentNextActionType.REDIRECT_TO_URL) {
      const paymentRequestNextAction = new PaymentRequestNextAction();
      paymentRequestNextAction.type = PaymentRequestNextActionType.REDIRECT_TO_URL;
      paymentRequestNextAction.url = nextAction.redirect_to_url.url;
      return paymentRequestNextAction;
    }
    return null;
  }

  private mapPaymentRequestNextActionToStripeNextAction(nextAction: PaymentRequestNextAction, paymentRequest: PaymentRequest): StripePaymentIntentNextAction {
    if (!nextAction) {
      return null;
    }
    if (nextAction.type === PaymentRequestNextActionType.REDIRECT_TO_URL) {
      const stripeNextAction = new StripePaymentIntentNextAction();
      stripeNextAction.type = StripePaymentIntentNextActionType.REDIRECT_TO_URL;
      stripeNextAction.redirect_to_url = {
        url: nextAction.url,
        return_url: paymentRequest.returnUrl
      };
      return stripeNextAction;
    }
    return null;
  }



} 