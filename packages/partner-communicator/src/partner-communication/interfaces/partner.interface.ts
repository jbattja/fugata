import { AuthorizePaymentRequestDto } from '../dto/authorize-payment-request.dto';
import { CapturePaymentRequestDto } from '../dto/capture-payment-request.dto';
import { RefundPaymentRequestDto } from '../dto/refund-payment-request.dto';
import { VoidPaymentRequestDto } from '../dto/void-payment-request.dto';
import { AuthenticatePaymentRequestDto } from '../dto/authenticate-payment-request.dto';
import { ConfirmPaymentRequestDto } from '../dto/confirm-payment-request.dto';
import { Capture, Payment, Refund, Void } from '@fugata/shared';

export interface PartnerInterface {
  readonly partnerName: string;
  readonly version: string;
  
  /**
   * Process a payment request with the partner
   */
  authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment>;
  authenticatePayment(request: AuthenticatePaymentRequestDto): Promise<Payment>;
  confirmPayment(request: ConfirmPaymentRequestDto): Promise<Payment>;
  capturePayment(request: CapturePaymentRequestDto): Promise<Capture>;
  refundPayment(request: RefundPaymentRequestDto): Promise<Refund>;
  voidPayment(request: VoidPaymentRequestDto): Promise<Void>;
  
  /**
   * Check if the partner is available and healthy
   */
  healthCheck(): Promise<boolean>;
} 