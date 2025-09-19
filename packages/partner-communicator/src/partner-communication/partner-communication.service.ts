import { Injectable } from '@nestjs/common';
import { PartnerRegistryService } from './partner-registry.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';
import { AuthenticatePaymentRequestDto } from './dto/authenticate-payment-request.dto';
import { Capture, Payment, Refund, Void } from '@fugata/shared';
import { CapturePaymentRequestDto } from './dto/capture-payment-request.dto';
import { RefundPaymentRequestDto } from './dto/refund-payment-request.dto';
import { VoidPaymentRequestDto } from './dto/void-payment-request.dto';
import { ConfirmPaymentRequestDto } from './dto/confirm-payment-request.dto';

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

  async authenticatePayment(request: AuthenticatePaymentRequestDto): Promise<Payment> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.authenticatePayment(request);
  }

  async capturePayment(request: CapturePaymentRequestDto): Promise<Capture> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.capturePayment(request);
  }

  async refundPayment(request: RefundPaymentRequestDto): Promise<Refund> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.refundPayment(request);
  }

  async voidPayment(request: VoidPaymentRequestDto): Promise<Void> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.voidPayment(request);
  }

  async confirmPayment(request: ConfirmPaymentRequestDto): Promise<Payment> {
    const partner = this.partnerRegistryService.getPartner(request.partnerName);
    
    if (!partner) {
      throw new Error(`Partner '${request.partnerName}' not found`);
    }

    return partner.confirmPayment(request);
  }
} 