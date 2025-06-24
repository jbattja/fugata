import { BaseAction } from './base-action';
import { PaymentContext } from '../types/workflow.types';
import { PaymentStatus } from '@fugata/shared';

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

    return context;
  }
}
