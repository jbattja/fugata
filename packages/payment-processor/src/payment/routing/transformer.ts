import { PaymentRequest, ProviderCredential } from '@fugata/shared';

export class PaymentRequestContext<T, R> {
  externalRequest: T;
  internalRequest: PaymentRequest;
  providerRequest: T;
  providerResponse: R;
  internalResponse: PaymentRequest;
  externalResponse: R;
  sourceProvider: ProviderTransformer<T, R>;
  targetProvider: ProviderTransformer<T, R>;
}

export interface PaymentRequestTransformer<T> {
  toPaymentRequest(source: T): PaymentRequest;
  fromPaymentRequest(paymentRequest: PaymentRequest): T;
  updateCredentials(paymentRequest: T): T;
}

export interface PaymentResponseTransformer<T, R> {
  toPaymentResponse(source: R, context: PaymentRequestContext<T, R>): PaymentRequest;
  fromPaymentResponse(response: PaymentRequest): R;
  updateCredentials(paymentResponse: R): R;
}

export interface PaymentConnector<T, R> {
  sendPayment(transformedRequest: T, context: PaymentRequestContext<T, R>): Promise<R>;
}

export abstract class ProviderTransformer<T,R> {
  abstract providerCode: string;
  abstract requestTransformer: PaymentRequestTransformer<T>;
  abstract responseTransformer: PaymentResponseTransformer<T, R>;
  abstract connector: PaymentConnector<T, R>;

  private providerCredentials: ProviderCredential;

  getProviderCredentials(): ProviderCredential {
    return this.providerCredentials;
  }

  setProviderCredentials(providerCredential: ProviderCredential): void {
    this.providerCredentials = providerCredential;
  }
} 

 export class TranformerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranformerError';
  }
 }