import { BaseAction } from './base-action';
import { PaymentContext } from '../types/workflow.types';
import { PaymentStatus } from '@fugata/shared';
import { ActionRegistry } from './action-registry';
import { extractAuthHeaders } from '../../clients/jwt.service';
import { TokenizationUtils } from '../tokenization.utils';

export class InitiatePaymentAction extends BaseAction {
  constructor() {
    super();
  }

  async execute(context: PaymentContext): Promise<PaymentContext> {
    this.log('Executing InitiatePayment action');

    // Initialize payment status
    context.payment.status = PaymentStatus.INITIATED;
    this.log(`Payment status set to ${PaymentStatus.INITIATED}`);
    context.authorizeAttempts = 0;
    context.captureAttempts = 0;
    context.refundAttempts = 0;
    context.voidAttempts = 0;
    context.config = {
      maxAuthorizeAttempts: 1,
      maxCaptureAttempts: 5,
      maxRefundAttempts: 5,
      maxVoidAttempts: 5
    };

    // Process payment instrument data if this is a card payment
    if (context.payment.paymentInstrument && context.merchant?.id) {
      try {
        const tokenVaultClient = ActionRegistry.getTokenVaultClient();
        if (!tokenVaultClient) {
          throw new Error('Token vault client not available');
        }
        
        const headers = extractAuthHeaders(context.request);
        
        const updatedInstrument = await TokenizationUtils.processPaymentInstrumentData(
          context.payment.paymentInstrument,
          context.merchant.id,
          tokenVaultClient,
          headers
        );
        context.payment.paymentInstrument = updatedInstrument;
      } catch (error) {
        this.log(`Payment instrument data processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }

    // Publish payment initiated event
    const paymentProducer = ActionRegistry.getPaymentProducer();
    if (paymentProducer) {
      await paymentProducer.publishPaymentInitiated(context.payment);
    } else {
      this.log('No payment producer found');
    }

    return context;
  }
}
