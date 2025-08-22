import { BaseAction } from './base-action';
import { PaymentContext } from '../types/workflow.types';
import { PaymentStatus } from '@fugata/shared';
import { ActionRegistry } from './action-registry';

export class InitiatePaymentAction extends BaseAction {
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
      maxAuthorizeAttempts: 5,
      maxCaptureAttempts: 5,
      maxRefundAttempts: 5,
      maxVoidAttempts: 5
    };

    // Publish payment initiated event
    const paymentProducer = ActionRegistry.getPaymentProducer();
    if (paymentProducer) {
      await paymentProducer.publishPaymentInitiated(context.payment);
      this.log('Published PAYMENT_INITIATED event');
    } else {
      this.log('No payment producer found');
    }

    return context;
  }
}
