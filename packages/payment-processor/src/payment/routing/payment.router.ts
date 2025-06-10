import { Inject, Injectable } from '@nestjs/common';
import { PaymentRequestContext, ProviderTransformer } from './transformer';
import { PaymentRequest, ProviderCredential } from '@fugata/shared';
import { SettingsClient } from '@fugata/shared';
import { PaymentProducerService } from 'src/kafka/payment-producer.service';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PaymentRouter {

  private providerTransformers: Map<string, ProviderTransformer<any, any>> = new Map();
  constructor(
    private readonly settingsClient: SettingsClient,
    private readonly paymentProducer: PaymentProducerService,
  ) {}

  registerProvider(provider: ProviderTransformer<any, any>) {
    this.providerTransformers.set(provider.providerCode, provider);
  }

  getProviderTransfomer(providerCredential: ProviderCredential): ProviderTransformer<any, any> {
    const provider = providerCredential.provider;
    if (!provider) {
      throw new Error(`Target provider for ${providerCredential.id} not found`);
    }
    const providerTransformer = this.providerTransformers.get(providerCredential.provider.providerCode);
    if (!providerTransformer) {
      throw new Error(`Provider transformer for ${providerCredential.provider.providerCode} not found`);
    }
    providerTransformer.setProviderCredentials(providerCredential);
    return providerTransformer;
  }

  async routePayment<T, R>(
    sourceProvider: ProviderTransformer<T, R>,
    merchantCode: string,
    merchantRequest: T
  ): Promise<R> {

    const context = new PaymentRequestContext<T, R>();
    context.externalRequest = merchantRequest;
    context.sourceProvider = sourceProvider;
    // Transform source request to our internal format
    context.internalRequest = context.sourceProvider.requestTransformer.toPaymentRequest(context.externalRequest);

    const conditions = this.extractConditions(context.internalRequest);
    const providerCredential = await this.settingsClient.getProviderCredentialForMerchant(merchantCode, conditions);
    if (!providerCredential) {
      throw new Error(`Target provider credential not found`);
    }
    context.targetProvider = this.getProviderTransfomer(providerCredential);

    const sameProvider = context.targetProvider.providerCode === context.sourceProvider.providerCode;
    if (sameProvider) {
      // If the source and target providers are the same, we only need to update the credentials
      context.providerRequest = context.sourceProvider.requestTransformer.updateCredentials(context.externalRequest);
    } else {
      // Otherwise, we need to transform the request to the target provider's format
      context.providerRequest = context.targetProvider.requestTransformer.fromPaymentRequest(context.internalRequest);
    }

    // Send payment through target provider's connector
    context.providerResponse = await context.targetProvider.connector.sendPayment(context.providerRequest, context);
    // Transform target response to our internal format
    context.internalResponse = context.targetProvider.responseTransformer.toPaymentResponse(context.providerResponse, context);
    context.internalResponse.providerCredentialCode = providerCredential.providerCredentialCode;
    context.internalResponse.providerCode = providerCredential.provider.providerCode;
    context.internalResponse.merchantCode = merchantCode;
    // Publish payment request to Kafka
    this.paymentProducer.publishPaymentRequest(this.mergeRequests(context.internalRequest, context.internalResponse));

    if (sameProvider) {
      // If the source and target providers are the same, we only need to update the credentials
      context.externalResponse = context.sourceProvider.responseTransformer.updateCredentials(context.providerResponse);
    } else {
      // Otherwise, we need to transform the response to the source provider's format
      context.externalResponse = context.sourceProvider.responseTransformer.fromPaymentResponse(context.internalResponse);
    }
    return context.externalResponse;
  }

  private mergeRequests(request: PaymentRequest, response: PaymentRequest): PaymentRequest {
    // Start with the original request
    const merged: PaymentRequest = {
      ...request,
      // Override with response values if they exist
      status: response.status || request.status,
      providerCredentialCode: response.providerCredentialCode || request.providerCredentialCode,
      providerCode: response.providerCode || request.providerCode,
      merchantCode: response.merchantCode || request.merchantCode,
      providerReference: response.providerReference || request.providerReference,
      failureReason: response.failureReason || request.failureReason,
      // Merge with any other non-null values from the response
      amount: response.amount || request.amount,
      paymentMethod: response.paymentMethod || request.paymentMethod,
      description: response.description || request.description,
      reference: response.reference || request.reference,
      returnUrl: response.returnUrl || request.returnUrl,
      customer: response.customer || request.customer,
      captureMethod: response.captureMethod || request.captureMethod,
      created: response.created || request.created,
      nextActionDetails: response.nextActionDetails || request.nextActionDetails,
      metadata: response.metadata || request.metadata
    };
    return merged;
  }

  private extractConditions(request: PaymentRequest): Record<string, any> {
    // Extract relevant conditions from the request
    // This should be customized based on your actual request structure
    return {
      payment_method: request.paymentMethod,
      country: request.metadata?.customerCountry,
      currency: request.amount?.currency,
      // Add more conditions as needed
    };
  }

  private selectProviderByWeight(
    weightedRules: { provider: any; weight: number }[]
  ): ProviderTransformer<any, any> | null {
    // Generate a random number between 0 and 1
    const random = Math.random();
    let cumulativeWeight = 0;

    // Find the provider based on the random number and weights
    for (const rule of weightedRules) {
      cumulativeWeight += rule.weight;
      if (random <= cumulativeWeight) {
        return this.providerTransformers.get(rule.provider.provider_id) || null;
      }
    }

    return null;
  }
} 