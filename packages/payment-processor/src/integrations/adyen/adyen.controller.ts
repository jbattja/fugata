import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { AdyenService } from './adyen.service';
import { AdyenPaymentRequest, AdyenPaymentResponse } from './types/adyen-payment';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentRouter } from '../../payment/routing/payment.router';

@ApiTags('adyen')
@Controller('adyen')
export class AdyenController {
  constructor(
    private readonly adyenService: AdyenService,
    private readonly paymentRouter: PaymentRouter
  ) {}

  @Post('payments')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: AdyenPaymentResponse })
  async createPayment(
    @Headers('X-Merchant-Id') merchantId: string,
    @Body() paymentRequest: AdyenPaymentRequest): Promise<AdyenPaymentResponse> {
    return this.paymentRouter.routePayment<AdyenPaymentRequest, AdyenPaymentResponse>(
      this.adyenService,
      merchantId,
      paymentRequest
    );
  }

  @Get('payments/:pspReference')
  @ApiOperation({ summary: 'Retrieve payment details' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully', type: AdyenPaymentResponse })
  async getPayment(@Param('pspReference') pspReference: string): Promise<AdyenPaymentResponse> {
    return this.adyenService.getPayment(pspReference);
  }
} 