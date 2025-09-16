import { PartnerInterface } from '../interfaces/partner.interface';
import { AuthorizePaymentRequestDto } from '../dto/authorize-payment-request.dto';
import { Capture, PartnerIntegrationClass, Payment, PaymentStatus, Refund, Void } from '@fugata/shared';
import { CapturePaymentRequestDto } from '../dto/capture-payment-request.dto';
import { RefundPaymentRequestDto } from '../dto/refund-payment-request.dto';
import { VoidPaymentRequestDto } from '../dto/void-payment-request.dto';

export abstract class BasePartner implements PartnerInterface {
  abstract readonly partnerName: PartnerIntegrationClass;
  abstract readonly version: string;

  abstract authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment>;
  abstract capturePayment(request: CapturePaymentRequestDto): Promise<Capture>;
  abstract refundPayment(request: RefundPaymentRequestDto): Promise<Refund>;
  abstract voidPayment(request: VoidPaymentRequestDto): Promise<Void>;

  async healthCheck(): Promise<boolean> {
    // Default health check - can be overridden by specific partners
    return true;
  }

  async createConnectionFailedPayment(payment: Payment, errorMessage: string): Promise<Payment> {
    return new Payment({
      ...payment,
      status: PaymentStatus.REFUSED,
      refusalReason: errorMessage || 'Connection failed',
    });
  }
}