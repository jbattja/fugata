import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { PaymentSessionsService } from './payment-sessions.service';
import { PaymentSession } from '@fugata/shared';

@Controller('payment-sessions')
export class PaymentSessionsController {
  constructor(private readonly paymentSessionsService: PaymentSessionsService) {}

  @Get()
  async listPaymentSessions(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
    @Query('reference') reference?: string,
    @Query('sessionId') sessionId?: string
  ) {
    const filters: Partial<PaymentSession> = {};
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
  async getPaymentSession(@Param('id') sessionId: string) {
    Logger.log(`Getting payment session ${sessionId}`, PaymentSessionsController.name);
    return this.paymentSessionsService.getPaymentSession(sessionId);
  }
} 