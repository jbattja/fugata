import { AuthorizePaymentRequestDto } from '../dto/authorize-payment-request.dto';
import { Payment } from '@fugata/shared';

export interface PartnerInterface {
  readonly partnerName: string;
  readonly version: string;
  
  /**
   * Process a payment request with the partner
   */
  authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment>;
  
  /**
   * Check if the partner is available and healthy
   */
  healthCheck(): Promise<boolean>;
} 