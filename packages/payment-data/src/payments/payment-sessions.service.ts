import { Injectable } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentSession, SessionStatus } from '@fugata/shared';

@Injectable()
export class PaymentSessionsService {
  constructor(
    @InjectRepository(PaymentSessionEntity)
    private readonly paymentSessionRepository: Repository<PaymentSessionEntity>
  ) { }

  async getPaymentSession(sessionId: string, merchantId?: string): Promise<PaymentSession | null> {
    SharedLogger.log(`Getting payment session: ${sessionId} for merchant: ${merchantId}`, undefined, PaymentSessionsService.name);

    let session: PaymentSessionEntity | null;

    if (!merchantId) {
      session = await this.paymentSessionRepository.findOne({ where: { sessionId: sessionId } });
    } else {
      // Use query builder for JSONB field filtering
      session = await this.paymentSessionRepository
        .createQueryBuilder('payment_session')
        .where('payment_session.session_id = :sessionId', { sessionId })
        .andWhere('CAST(payment_session.merchant->>\'id\' AS UUID) = :merchantId', { merchantId })
        .getOne();
    }

    if (!session) {
      return null;
    }

    // Check if session has expired and update status if needed
    if (session.status !== SessionStatus.EXPIRED && session.expiresAt && session.expiresAt < new Date()) {
      session.status = SessionStatus.EXPIRED;
      session.updatedAt = new Date();
      await this.paymentSessionRepository.save(session);
      SharedLogger.log(`Session ${sessionId} has expired and status updated`, undefined, PaymentSessionsService.name);
    }

    return session.toPaymentSession();
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
    if (filters.merchant?.id) {
      query.andWhere('CAST(payment_session.merchant->>\'id\' AS UUID) = :merchantId', { merchantId: filters.merchant.id });
    }
    if (filters.merchant?.accountCode) {
      query.andWhere('payment_session.merchant->>\'accountCode\' = :accountCode', { accountCode: filters.merchant.accountCode });
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
    SharedLogger.log(`Creating payment session ${JSON.stringify(paymentSession)}`, undefined, PaymentSessionsService.name);
    const entity = this.paymentSessionRepository.create(paymentSession);
    const savedEntity = await this.paymentSessionRepository.save(entity);
    return savedEntity.toPaymentSession();
  }

  async updatePaymentSession(paymentSessionId: string, updates: Partial<PaymentSession>): Promise<PaymentSession | null> {
    SharedLogger.log(`Updating payment session ${paymentSessionId}`, undefined, PaymentSessionsService.name);
    const existingPaymentSession = await this.paymentSessionRepository.findOne({ where: { sessionId: paymentSessionId } });
    if (!existingPaymentSession) {
      return null;
    }

    // Update the entity with new values
    Object.assign(existingPaymentSession, updates);
    const updatedEntity = await this.paymentSessionRepository.save(existingPaymentSession);
    return updatedEntity.toPaymentSession();
  }

  /**
   * Expires all sessions that have passed their expiry date
   * This method is called by the scheduled job
   */
  async expireSessions(): Promise<number> {
    const now = new Date();
    
    try {
      const result = await this.paymentSessionRepository
        .createQueryBuilder()
        .update(PaymentSessionEntity)
        .set({ 
          status: SessionStatus.EXPIRED,
          updatedAt: now
        })
        .where('expires_at < :now', { now })
        .andWhere('status != :expiredStatus', { expiredStatus: SessionStatus.EXPIRED })
        .andWhere('status != :completedStatus', { completedStatus: SessionStatus.COMPLETED })
        .andWhere('status != :cancelledStatus', { cancelledStatus: SessionStatus.CANCELLED })
        .andWhere('status != :failedStatus', { failedStatus: SessionStatus.FAILED })
        .execute();

      const expiredCount = result.affected || 0;
      
      if (expiredCount > 0) {
        SharedLogger.log(`Expired ${expiredCount} payment sessions`, undefined, PaymentSessionsService.name);
      }
      
      return expiredCount;
    } catch (error) {
      SharedLogger.error('Error expiring sessions:', error as any, PaymentSessionsService.name);
      throw error;
    }
  }

  /**
   * Checks if a session is expired without updating the database
   */
  isSessionExpired(session: PaymentSession): boolean {
    return session.expiresAt && session.expiresAt < new Date();
  }
} 