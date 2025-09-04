import { Injectable } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { Payment } from '@fugata/shared';
import { PaymentSessionEntity } from '../entities/payment-session.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(PaymentSessionEntity)
    private readonly paymentSessionRepository: Repository<PaymentSessionEntity>
  ) {}

  async getPayment(paymentId: string, merchantId?: string): Promise<Payment | null> {
    SharedLogger.log(`Getting payment: ${paymentId} for merchant: ${merchantId}`, undefined, PaymentsService.name);
    
    if (!merchantId) {
      const payment = await this.paymentRepository.findOne({ where: { paymentId: paymentId} });
      return payment;
    } 
    
    // Use query builder for JSONB field filtering
    return await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.payment_id = :paymentId', { paymentId })
      .andWhere('CAST(payment.merchant->>\'id\' AS UUID) = :merchantId', { merchantId })
      .getOne();
  }

  async listPayments(
    skip: number = 0,
    take: number = 10,
    filters: Partial<Payment> = {}
  ): Promise<{ data: Payment[] }> {
    const query = this.paymentRepository.createQueryBuilder('payment');

    // Apply filters
    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }
    if (filters.reference) {
      query.andWhere('payment.reference = :reference', { reference: filters.reference });
    }
    if (filters.paymentId) {
      query.andWhere('payment.payment_id = :paymentId', { paymentId: filters.paymentId });
    }
    if (filters.merchant?.id) {
      query.andWhere('CAST(payment.merchant->>\'id\' AS UUID) = :merchantId', { merchantId: filters.merchant.id });
    }
    if (filters.merchant?.accountCode) {
      query.andWhere('payment.merchant->>\'accountCode\' = :accountCode', { accountCode: filters.merchant.accountCode });
    }
    if (filters.settlementStatus) {
      query.andWhere('payment.settlement_status = :settlementStatus', { settlementStatus: filters.settlementStatus });
    }
    if (filters.chargebackStatus) {
      query.andWhere('payment.chargeback_status = :chargebackStatus', { chargebackStatus: filters.chargebackStatus });
    }

    // Apply pagination
    query.skip(skip).take(take);

    // Order by creation date
    query.orderBy('payment.created_at', 'DESC');

    const entities = await query.getMany();
    return {
      data: entities.map(entity => entity.toPayment())
    };
  }

  async createPayment(payment: Payment): Promise<Payment> {
    if (payment.sessionId) {
      const session = await this.paymentSessionRepository.findOne({ where: { sessionId: payment.sessionId } });
      if (!session) {
        payment.sessionId = null;
      }
    }
    SharedLogger.log(`Creating payment ${JSON.stringify(payment)}`, undefined, PaymentsService.name);
    const entity = this.paymentRepository.create(payment);
    const savedEntity = await this.paymentRepository.save(entity);
    return savedEntity.toPayment();
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment | null> {
    if (updates.sessionId) {
      const session = await this.paymentSessionRepository.findOne({ where: { sessionId: updates.sessionId } });
      if (!session) {
        updates.sessionId = null;
      }
    }
    SharedLogger.log(`Updating payment: ${paymentId}`, undefined, PaymentsService.name);
    
    const existingPayment = await this.paymentRepository.findOne({ where: { paymentId } });
    if (!existingPayment) {
      return null;
    }

    // Update the entity with new values
    Object.assign(existingPayment, updates);
    const updatedEntity = await this.paymentRepository.save(existingPayment);
    return updatedEntity.toPayment();
  }
}
