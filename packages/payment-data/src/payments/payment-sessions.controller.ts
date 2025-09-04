import { Controller, Get, Query, Param, Req, NotFoundException, UnauthorizedException, Post } from '@nestjs/common';
import { getMerchantIds, isAdmin, SharedLogger } from '@fugata/shared';
import { PaymentSessionsService } from './payment-sessions.service';
import { SessionExpirationService } from './session-expiration.service';
import { PaymentSession, RequirePermissions, getMerchant } from '@fugata/shared';

@Controller('payment-sessions')
export class PaymentSessionsController {
  constructor(
    private readonly paymentSessionsService: PaymentSessionsService,
    private readonly sessionExpirationService: SessionExpirationService
  ) {}

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
    let merchantIds = [];
    if (merchant && merchant.id) {
      merchantIds = [merchant.id];
    } else {
      merchantIds = getMerchantIds(request);
    }
    if (!isAdmin(request) && merchantIds.length === 0) {
      throw new UnauthorizedException('No merchant found');
    }
    
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

  @Post('expire')
  @RequirePermissions('payments:write')
  async triggerSessionExpiration(@Req() request?: any) {
    if (!isAdmin(request)) {
      throw new UnauthorizedException('Only administrators can trigger session expiration');
    }
    
    SharedLogger.log('Manual session expiration triggered', undefined, PaymentSessionsController.name);
    const expiredCount = await this.sessionExpirationService.triggerExpiration();
    
    return {
      message: `Successfully expired ${expiredCount} sessions`,
      expiredCount
    };
  }

  @Get('expiration/health')
  @RequirePermissions('payments:read')
  async getExpirationHealth(@Req() request?: any) {
    if (!isAdmin(request)) {
      throw new UnauthorizedException('Only administrators can check expiration health');
    }
    
    return await this.sessionExpirationService.healthCheck();
  }
} 