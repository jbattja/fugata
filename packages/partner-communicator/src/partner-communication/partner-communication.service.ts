import { Injectable } from '@nestjs/common';
import { PartnerRegistryService } from './partner-registry.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';
import { Capture, Payment } from '@fugata/shared';
import { CapturePaymentRequestDto } from './dto/capture-payment-request.dto';

@Injectable()
export class PartnerCommunicationService {
  constructor(
    private readonly partnerRegistryService: PartnerRegistryService,
  ) {}

  async authorizePayment(request: AuthorizePaymentRequestDto): Promise<Payment> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.authorizePayment(request);
  }

  async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.capturePayment(request);
  }
} 