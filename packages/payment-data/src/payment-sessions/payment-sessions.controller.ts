import { Controller, Get, Query, Param, Req, NotFoundException } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { PaymentSessionsService } from './payment-sessions.service';
import { PaymentSession, RequirePermissions, getMerchant } from '@fugata/shared';

@Controller('payment-sessions')
export class PaymentSessionsController {
  constructor(private readonly paymentSessionsService: PaymentSessionsService) {}

  @Get()
  @RequirePermissions('payments:read')
  async listPaymentSessions(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('reference') reference?: string,
    @Query('sessionId') sessionId?: string,
    @Req() request?: any
  ) {
    const merchant = getMerchant(request);
    SharedLogger.log(`Listing payment sessions for merchant: ${merchant.id}`, undefined, PaymentSessionsController.name);
    
    const filters: Partial<PaymentSession> = {};
    if (merchant && merchant.id) filters.merchant = { id: merchant.id };
    if (merchant && merchant.accountCode) filters.merchant = { accountCode: merchant.accountCode };
    if (status) filters.status = status as any;
    if (reference) filters.reference = reference;
    if (sessionId) filters.sessionId = sessionId;

    return this.paymentSessionsService.listPaymentSessions(
      skip ? parseInt(skip.toString()) : undefined,
      take ? parseInt(take.toString()) : undefined,
      filters
    );
  }

  @Get(':id')
  @RequirePermissions('payments:read')
  async getPaymentSession(@Param('id') sessionId: string, @Req() request?: any) {
    SharedLogger.log(`Getting payment session: ${sessionId}`, undefined, PaymentSessionsController.name);
    const merchant = getMerchant(request);
    let session: PaymentSession | null = null;
    if (!merchant || !merchant.id) {
      session = await this.paymentSessionsService.getPaymentSession(sessionId);
    } else {
      session = await this.paymentSessionsService.getPaymentSession(sessionId, merchant.id);
    }
    if (!session) {
      throw new NotFoundException('Payment session not found');
    }
    return session;
  }
} 