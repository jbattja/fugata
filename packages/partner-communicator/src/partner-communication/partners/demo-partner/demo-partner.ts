import { BasePartner } from '../../base/base-partner';
import { AuthorizePaymentRequestDto } from '../../dto/authorize-payment-request.dto';
import { AuthenticatePaymentRequestDto } from '../../dto/authenticate-payment-request.dto';
import { ConfirmPaymentRequestDto } from '../../dto/confirm-payment-request.dto';
import { Capture, PartnerIntegrationClass, Payment, Refund, Void } from '@fugata/shared';
import { DemoPartnerAuthorize } from './demo-partner-authorize';
import { Logger } from '@nestjs/common';
import { CapturePaymentRequestDto } from 'src/partner-communication/dto/capture-payment-request.dto';
import { RefundPaymentRequestDto } from 'src/partner-communication/dto/refund-payment-request.dto';
import { VoidPaymentRequestDto } from 'src/partner-communication/dto/void-payment-request.dto';
import { DemoPartnerCapture } from './demo-partner-capture';
import { DemoPartnerRefund } from './demo-partner-refund';
import { DemoPartnerVoid } from './demo-partner-void';
import { UnsupportedOperationError } from 'src/partner-communication/exceptions/unsupported-operation-error.filter';

export class DemoPartner extends BasePartner {
  readonly partnerName = PartnerIntegrationClass.DEMO_PARTNER;
  readonly version = '1.0.0';

  async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
      // Simulate processing with the partner
      Logger.log(`Processing payment ${request.payment.paymentId} with Demo Partner`, DemoPartner.name);
      return DemoPartnerAuthorize.authorize(request);
  }

  async authenticatePayment(_request: AuthenticatePaymentRequestDto): Promise<Payment> {
    throw new UnsupportedOperationError('Demo partner authentication not implemented');
  }

  async confirmPayment(request: ConfirmPaymentRequestDto): Promise<Payment> {
    return DemoPartnerAuthorize.confirm(request);
  } 

  async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
    return DemoPartnerCapture.capture(request);
  }

  async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
    return DemoPartnerRefund.refund(request);
  }

  async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
    return DemoPartnerVoid.void(request);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simulate health check
      Logger.log('Sample partner health check', DemoPartner.name);
      return true;
    } catch (error) {
      return false;
    }
  }
}