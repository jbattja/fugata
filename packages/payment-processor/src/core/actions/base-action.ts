import { SharedLogger } from '@fugata/shared';
import { ActionInterface, PaymentContext } from '../types/workflow.types';
import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

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
} 