import { BasePartner } from '../../base/base-partner';
import { AuthorizePaymentRequestDto } from '../../dto/authorize-payment-request.dto';
import { Capture, PartnerIntegrationClass, Payment } from '@fugata/shared';
import { DemoPartnerAuthorize } from './demo-partner-authorize';
import { Logger } from '@nestjs/common';
import { CapturePaymentRequestDto } from 'src/partner-communication/dto/capture-payment-request.dto';
import { DemoPartnerCapture } from './demo-partner-capture';

export class DemoPartner extends BasePartner {
  readonly partnerName = PartnerIntegrationClass.DEMO_PARTNER;
  readonly version = '1.0.0';

  async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
      // Simulate processing with the partner
      Logger.log(`Processing payment ${request.payment.paymentId} with Demo Partner`, DemoPartner.name);
      return DemoPartnerAuthorize.authorize(request);
  } 
  async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
    return DemoPartnerCapture.capture(request);
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