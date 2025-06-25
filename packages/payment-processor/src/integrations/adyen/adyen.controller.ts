import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { AdyenService } from './adyen.service';
import { AdyenPaymentRequest, AdyenPaymentResponse } from './types/adyen-payment';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentRouter } from '../../payment/routing/payment.router';
import { getMerchant } from '../../../../shared/src/auth/service-auth.guard';

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
    @Body() paymentRequest: AdyenPaymentRequest,
    @Req() req: Request
  ): Promise<AdyenPaymentResponse> {
    const merchant = getMerchant(req)
    return this.paymentRouter.routePayment<AdyenPaymentRequest, AdyenPaymentResponse>(
      this.adyenService,
      merchant.id,
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