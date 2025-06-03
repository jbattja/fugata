import { Controller, Post, Body, Get, Param, Headers } from '@nestjs/common';
import { StripePaymentIntentService } from './stripe-payment-intent.service';
import { StripePaymentIntent } from './types/stripe-payment-intent';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PaymentRouter } from '../../payment/routing/payment.router';

@ApiTags('stripe')
@Controller('stripe/v1')
export class StripeController {
  constructor(
    private readonly stripeService: StripePaymentIntentService,
    private readonly paymentRouter: PaymentRouter
  ) {}

  @Post('payment_intents')
  @ApiHeader({ name: 'X-Merchant-Id', description: 'Merchant ID' })
  @ApiOperation({ summary: 'Create a new payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully', type: StripePaymentIntent })
  async createPaymentIntent(
    @Headers('X-Merchant-Id') merchantId: string,
    @Body() paymentIntent: Partial<StripePaymentIntent>
  ): Promise<StripePaymentIntent> {
    return this.paymentRouter.routePayment<Partial<StripePaymentIntent>, StripePaymentIntent>(
      this.stripeService,
      merchantId,
      paymentIntent
    );
  }

  @Get('payment_intents/:id')
  @ApiOperation({ summary: 'Retrieve a payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully', type: StripePaymentIntent })
  async getPaymentIntent(@Param('id') id: string): Promise<StripePaymentIntent> {
    return this.stripeService.getPaymentIntent(id);
  }
} 