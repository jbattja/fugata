import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PartnerCommunicationService } from './partner-communication.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';
import { SharedLogger } from '@fugata/shared';

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
} 