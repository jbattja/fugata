import { Controller, Get, Query, Param, Logger, Req, NotFoundException } from '@nestjs/common';
import { PaymentSessionsService } from './payment-sessions.service';
import { PaymentSession, RequirePermissions, getMerchantId } from '@fugata/shared';

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
    const merchantId = getMerchantId(request);
    Logger.log(`Listing payment sessions for merchant: ${merchantId}`, PaymentSessionsController.name);
    
    const filters: Partial<PaymentSession> = {};
    if (merchantId) filters.merchantCode = merchantId;
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
    const merchantId = getMerchantId(request);
    Logger.log(`Getting payment session ${sessionId} for merchant: ${merchantId}`, PaymentSessionsController.name);
    
    // Ensure the session belongs to the authenticated merchant
    const session = await this.paymentSessionsService.getPaymentSession(sessionId, merchantId);
    if (!session) {
      throw new NotFoundException('Payment session not found');
    }
    return session;
  }
} 