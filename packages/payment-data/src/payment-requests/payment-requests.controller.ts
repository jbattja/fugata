import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PaymentRequestsService } from './payment-requests.service';
import { PaymentRequest } from '@fugata/shared';

@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  @Get()
  async listPaymentRequests(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('reference') reference?: string
  ) {
    const filters: Partial<PaymentRequest> = {};
    if (status) filters.status = status as any;
    if (paymentMethod) filters.paymentMethod = paymentMethod as any;
    if (reference) filters.reference = reference;

    return this.paymentRequestsService.listPaymentRequests(
      skip ? parseInt(skip.toString()) : undefined,
      take ? parseInt(take.toString()) : undefined,
      filters
    );
  }

  @Get(':id')
  async getPaymentRequest(@Param('id') id: string) {
    return this.paymentRequestsService.getPaymentRequest(id);
  }
} 