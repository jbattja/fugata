import { Controller, Get, Query, Param, Req, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getMerchantIds, isAdmin, SharedLogger } from '@fugata/shared';
import { PaymentsService } from './payments.service';
import { Payment, RequirePermissions, getMerchant } from '@fugata/shared';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @RequirePermissions('payments:read')
  async listPayments(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('reference') reference?: string,
    @Query('paymentId') paymentId?: string,
    @Query('settlementStatus') settlementStatus?: string,
    @Query('chargebackStatus') chargebackStatus?: string,
    @Req() request?: any
  ) {
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
    const filters: Partial<Payment> = {};
    if (merchant && merchant.id) filters.merchant = { id: merchant.id };
    if (merchant && merchant.accountCode) filters.merchant = { accountCode: merchant.accountCode };
    if (status) filters.status = status as any;
    if (reference) filters.reference = reference;
    if (paymentId) filters.paymentId = paymentId;
    if (settlementStatus) filters.settlementStatus = settlementStatus as any;
    if (chargebackStatus) filters.chargebackStatus = chargebackStatus as any;

    return this.paymentsService.listPayments(
      skip ? parseInt(skip.toString()) : undefined,
      take ? parseInt(take.toString()) : undefined,
      filters
    );
  }

  @Get(':id')
  @RequirePermissions('payments:read')
  async getPayment(@Param('id') paymentId: string, @Req() request?: any) {
    SharedLogger.log(`Getting payment: ${paymentId}`, undefined, PaymentsController.name);
    const merchant = getMerchant(request);
    let payment: Payment | null = null;
    if (!merchant || !merchant.id) {
      payment = await this.paymentsService.getPayment(paymentId);
    } else {
      payment = await this.paymentsService.getPayment(paymentId, merchant.id);
    }
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
