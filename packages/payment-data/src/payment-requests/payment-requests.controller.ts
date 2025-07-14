import { Controller, Get, Param, Query, Req, UnauthorizedException } from '@nestjs/common';
import { PaymentRequestsService } from './payment-requests.service';
import { getMerchant, getMerchantIds, isAdmin, PaymentRequest, RequirePermissions } from '@fugata/shared';

@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  @Get()
  @RequirePermissions('payments:read')
  async listPaymentRequests(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('reference') reference?: string,
    @Req() request?: any
  ) {
    const filters: Partial<PaymentRequest> = {};
    if (status) filters.status = status as any;
    if (paymentMethod) filters.paymentMethod = paymentMethod as any;
    if (reference) filters.reference = reference;
    const merchant = getMerchant(request);
    let merchantIds = [];
    if (merchant && merchant.id) {
      merchantIds = [merchant.id];
    } else {
      merchantIds = getMerchantIds(request);
    }
    if (!isAdmin(request) && merchantIds.length === 0) {
      throw new UnauthorizedException('No merchant found');
    }
    return this.paymentRequestsService.listPaymentRequests(
      skip ? parseInt(skip.toString()) : undefined,
      take ? parseInt(take.toString()) : undefined,
      filters,
      merchantIds
    );
  }

  @Get(':id')
  @RequirePermissions('payments:read')
  async getPaymentRequest(@Param('id') id: string) {
    return this.paymentRequestsService.getPaymentRequest(id);
  }
} 