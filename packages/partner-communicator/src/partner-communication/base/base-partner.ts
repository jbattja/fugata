import { PartnerInterface } from '../interfaces/partner.interface';
import { AuthorizePaymentRequestDto } from '../dto/authorize-payment-request.dto';
import { PartnerIntegrationClass, Payment, PaymentStatus } from '@fugata/shared';

export abstract class BasePartner implements PartnerInterface {
  abstract readonly partnerName: PartnerIntegrationClass;
  abstract readonly version: string;

  abstract authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment>;

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