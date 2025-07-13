import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PartnerCommunicationService } from './partner-communication.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';

@Controller('partner-communication')
export class PartnerCommunicationController {
  constructor(
    private readonly partnerCommunicationService: PartnerCommunicationService,
  ) {}

  @Post('authorize-payment')
  @HttpCode(HttpStatus.OK)
  async authorizePayment(@Body() request: AuthorizePaymentRequestDto) {
    Logger.log('Authorize payment request', request, PartnerCommunicationController.name);
    return this.partnerCommunicationService.authorizePayment(request);
  }
} 