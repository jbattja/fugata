import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentSession } from '@fugata/shared';

@Injectable()
export class PaymentSessionsService {
  constructor(
    @InjectRepository(PaymentSessionEntity)
    private readonly paymentSessionRepository: Repository<PaymentSessionEntity>
  ) {}

  async getPaymentSession(sessionId: string, merchantId: string): Promise<PaymentSession | null> {
    Logger.log(`Getting payment session ${sessionId}`, PaymentSessionsService.name);
    const entity = await this.paymentSessionRepository.findOne({ where: { sessionId: sessionId, merchantCode: merchantId } });
    Logger.log(`Payment session ${sessionId} found: ${entity ? 'true' : 'false'}`, PaymentSessionsService.name);
    return entity ? entity.toPaymentSession() : null;
  }

  async listPaymentSessions(
    skip: number = 0,
    take: number = 10,
    filters: Partial<PaymentSession> = {}
  ): Promise<{ data: PaymentSession[] }> {
    const query = this.paymentSessionRepository.createQueryBuilder('payment_session');

    // Apply filters
    if (filters.status) {
      query.andWhere('payment_session.status = :status', { status: filters.status });
    }
    if (filters.reference) {
      query.andWhere('payment_session.reference = :reference', { reference: filters.reference });
    }
    if (filters.sessionId) {
      query.andWhere('payment_session.session_id = :sessionId', { sessionId: filters.sessionId });
    }

    // Apply pagination
    query.skip(skip).take(take);

    // Order by creation date
    query.orderBy('payment_session.created_at', 'DESC');

    const entities = await query.getMany();
    return {
      data: entities.map(entity => entity.toPaymentSession())
    };
  }

  async createPaymentSession(paymentSession: PaymentSession): Promise<PaymentSession> {
    Logger.log(`Creating payment session ${JSON.stringify(paymentSession)}`, PaymentSessionsService.name);
    const entity = this.paymentSessionRepository.create(paymentSession);
    const savedEntity = await this.paymentSessionRepository.save(entity);
    return savedEntity.toPaymentSession();
  }
} 