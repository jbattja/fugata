import { Logger } from '@nestjs/common';
import { ActionInterface, PaymentContext } from '../types/workflow.types';

export abstract class BaseAction implements ActionInterface {
  abstract execute(context: PaymentContext): Promise<PaymentContext>;
  
  protected log(message: string, context?: any): void {
    Logger.log(`${message}`, context || '', this.constructor.name);
  }
  
  protected error(message: string, error?: any): void {
    Logger.error(`${message}`, error || '', this.constructor.name);
  }
} 