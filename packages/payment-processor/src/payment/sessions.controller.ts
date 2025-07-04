import { Body, Controller, Post, Logger, Req } from '@nestjs/common';
import { PaymentSession, SessionStatus, RequirePermissions, getMerchant, SessionMode } from '@fugata/shared';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { PaymentProducerService } from '../kafka/payment-producer.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  private readonly logger = new Logger(SessionsController.name);

  constructor(
    private readonly paymentProducer: PaymentProducerService,
  ) {}

  @Post()
  @RequirePermissions('payments:write')
  @ApiOperation({ summary: 'Create a new payment session' })
  @ApiResponse({ status: 201, description: 'Payment session created successfully', type: PaymentSession })
  async createSession(@Body() sessionData: CreateSessionDto, @Req() request: any): Promise<PaymentSession> {
    const merchant = getMerchant(request);
    this.logger.log(`Creating payment session for merchant: ${merchant.id}`);
    
    const paymentLinkUrl = process.env.PAYMENT_LINK_URL || 'http://localhost:8080';
    const sessionId = uuidv4();
    const expiresAt = sessionData.mode === SessionMode.HOSTED ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now for hosted sessions
    : new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now for component sessions

    const session = new PaymentSession({  
      sessionId: sessionId,
      status: SessionStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: expiresAt,
      url: `${paymentLinkUrl}/session/${sessionId}`,
      merchant: {
        id: merchant.id,
        accountCode: merchant.accountCode
      },
    });
    
    // Merge provided data
    Object.assign(session, sessionData);

    // Publish session to Kafka
    await this.paymentProducer.publishPaymentSession(session);
    
    return session;
  }
}
