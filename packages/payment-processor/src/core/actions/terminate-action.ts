import { BaseAction } from './base-action';
import { PaymentContext } from '../types/workflow.types';

export class TerminateAction extends BaseAction {
  async execute(context: PaymentContext): Promise<PaymentContext> {
    this.log('Executing Terminate action - ending workflow');    
    return context;
  }
} 