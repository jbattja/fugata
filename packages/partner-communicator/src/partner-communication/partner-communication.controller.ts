import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PartnerCommunicationService } from './partner-communication.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';
import { SharedLogger } from '@fugata/shared';
import { CapturePaymentRequestDto } from './dto/capture-payment-request.dto';

@Controller('partner-communication')
export class PartnerCommunicationController {
  constructor(
    private readonly partnerCommunicationService: PartnerCommunicationService,
  ) {}

  @Post('authorize-payment')
  @HttpCode(HttpStatus.OK)
  async authorizePayment(@Body() request: AuthorizePaymentRequestDto) {
    SharedLogger.log('Authorize payment request' + (request?.payment?.paymentId ? ', payment id: ' + request?.payment?.paymentId : ''), undefined, PartnerCommunicationController.name);
    return this.partnerCommunicationService.authorizePayment(request);
  }

  @Post('capture-payment')
  @HttpCode(HttpStatus.OK)
  async capturePayment(@Body() request: CapturePaymentRequestDto) {
    SharedLogger.log('Capture payment request' + (request?.capture?.captureId ? ', capture id: ' + request?.capture?.captureId : '') + (request?.payment?.paymentId ? ', payment id: ' + request?.payment?.paymentId : ''), undefined, PartnerCommunicationController.name);
    return this.partnerCommunicationService.capturePayment(request);
  }
} 