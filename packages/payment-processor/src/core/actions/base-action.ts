import { ActionInterface, PaymentContext } from '../types/workflow.types';
import { Logger } from '@nestjs/common';
import { ProviderCredential, Operation, OperationType, OperationStatus } from '@fugata/shared';
import { extractAuthHeaders } from 'src/clients/jwt.service';

export abstract class BaseAction implements ActionInterface {
  abstract execute(context: PaymentContext): Promise<PaymentContext>;
  
  protected log(message: string, data?: any): void {
    if (data) {
      Logger.log(`${message}`,data, this.constructor.name);
    } else {
      Logger.log(`${message}`, this.constructor.name);
    }
  } 
  
  protected error(message: string, error?: any): void {
    if (error && error.response && error.response.data) {
      Logger.error(`${message}`, error.response.data, this.constructor.name);
    } else if (error && error.message) {
      Logger.error(`${message}`, error.message, this.constructor.name);
    } else {
      Logger.error(`${message}`, this.constructor.name);
    }
  }

  protected async getPartnerConfig(context: PaymentContext) {
    // Import ActionRegistry dynamically to avoid circular dependency
    const { ActionRegistry } = await import('./action-registry');
    
    let providerCredential = context.providerCredential;
    if (!this.isProviderCredentialValid(providerCredential)) {
      if (providerCredential && providerCredential.id) {
        providerCredential = await ActionRegistry.getSettingsClient().getProviderCredential(
          extractAuthHeaders(context.request), providerCredential.id);
      } else {
        providerCredential = await ActionRegistry.getSettingsClient().getProviderCredentialForMerchant(
          extractAuthHeaders(context.request), context.merchant.id, context.payment.paymentInstrument.paymentMethod);
      }
    }
    if (!providerCredential) {
      throw new Error(`No provider credential found for merchant ${context.merchant.id} with payment method ${context.payment.paymentInstrument.paymentMethod}`);
    }
    context.providerCredential = providerCredential;
    return { ...providerCredential.provider.settings, ...providerCredential.settings };
  }

  protected isProviderCredentialValid(providerCredential: Partial<ProviderCredential>) {
    if (!providerCredential) {
      return false;
    }
    if (!providerCredential.id || !providerCredential.accountCode) {
      return false;
    }
    if (!providerCredential.provider || !providerCredential.settings) {
      return false;
    }
    return true;
  }

  protected getOperationsByType(context: PaymentContext, operationType: OperationType): Operation[] {
    if (!context.operations) {
      return [];
    }
    return context.operations.filter(op => op.operationType === operationType);
  }

  protected getSuccessfulOperationsByType(context: PaymentContext, operationType: OperationType): Operation[] {
    return this.getOperationsByType(context, operationType)
      .filter(op => op.status === OperationStatus.SUCCEEDED);
  }

  protected calculateTotalAmount(operations: Operation[]): number {
    return operations.reduce((total, op) => {
      return total + (op.amount?.value || 0);
    }, 0);
  }

  protected getTotalAmountCaptured(context: PaymentContext): number {
    const successfulCaptures = this.getSuccessfulOperationsByType(context, OperationType.CAPTURE);
    return this.calculateTotalAmount(successfulCaptures);
  }

  protected getAmountCapturable(context: PaymentContext): number {
    // Check if any void operation exists
    const voidOperations = this.getOperationsByType(context, OperationType.VOID);
    if (voidOperations.length > 0) {
      return 0; // Cannot capture if void operation exists
    }
    
    const totalCaptured = this.getTotalAmountCaptured(context);
    const paymentAmount = context.payment.amount?.value || 0;
    return Math.max(0, paymentAmount - totalCaptured);
  }

  protected getTotalAmountRefunded(context: PaymentContext): number {
    const successfulRefunds = this.getSuccessfulOperationsByType(context, OperationType.REFUND);
    return this.calculateTotalAmount(successfulRefunds);
  }

  protected getAmountRefundable(context: PaymentContext): number {
    const totalCaptured = this.getTotalAmountCaptured(context);
    const totalRefunded = this.getTotalAmountRefunded(context);
    return Math.max(0, totalCaptured - totalRefunded);
  }
  
} 