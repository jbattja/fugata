import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PartnerCommunicationService } from './partner-communication.service';
import { AuthorizePaymentRequestDto } from './dto/authorize-payment-request.dto';
import { SharedLogger } from '@fugata/shared';
import { CapturePaymentRequestDto } from './dto/capture-payment-request.dto';
import { RefundPaymentRequestDto } from './dto/refund-payment-request.dto';
import { VoidPaymentRequestDto } from './dto/void-payment-request.dto';

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
    SharedLogger.log('Capture payment request' + (request?.capture?.operationId ? ', operation id: ' + request?.capture?.operationId : '') + (request?.payment?.paymentId ? ', payment id: ' + request?.payment?.paymentId : ''), undefined, PartnerCommunicationController.name);
    return this.partnerCommunicationService.capturePayment(request);
  }

  @Post('refund-payment')
  @HttpCode(HttpStatus.OK)
  async refundPayment(@Body() request: RefundPaymentRequestDto) {
    SharedLogger.log('Refund payment request' + (request?.refund?.operationId ? ', operation id: ' + request?.refund?.operationId : '') + (request?.payment?.paymentId ? ', payment id: ' + request?.payment?.paymentId : ''), undefined, PartnerCommunicationController.name);
    return this.partnerCommunicationService.refundPayment(request);
  }

  @Post('void-payment')
  @HttpCode(HttpStatus.OK)
  async voidPayment(@Body() request: VoidPaymentRequestDto) {
    SharedLogger.log('Void payment request' + (request?.voidOperation?.operationId ? ', operation id: ' + request?.voidOperation?.operationId : '') + (request?.payment?.paymentId ? ', payment id: ' + request?.payment?.paymentId : ''), undefined, PartnerCommunicationController.name);
    return this.partnerCommunicationService.voidPayment(request);
  }
} 