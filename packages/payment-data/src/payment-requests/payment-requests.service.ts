import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentRequestEntity } from '../entities/payment-request.entity';
import { PaymentRequest } from '@fugata/shared';

@Injectable()
export class PaymentRequestsService {
  constructor(
    @InjectRepository(PaymentRequestEntity)
    private readonly paymentRequestRepository: Repository<PaymentRequestEntity>
  ) {}

  async getPaymentRequest(id: string): Promise<PaymentRequest | null> {
    const entity = await this.paymentRequestRepository.findOne({ where: { id } });
    return entity ? entity.toPaymentRequest() : null;
  }

  async listPaymentRequests(
    skip: number = 0,
    take: number = 10,
    filters: Partial<PaymentRequest> = {}
  ): Promise<{ data: PaymentRequest[]; total: number }> {
    const query = this.paymentRequestRepository.createQueryBuilder('payment_request');

    // Apply filters
    if (filters.status) {
      query.andWhere('payment_request.status = :status', { status: filters.status });
    }
    if (filters.paymentMethod) {
      query.andWhere('payment_request.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
    }
    if (filters.reference) {
      query.andWhere('payment_request.reference = :reference', { reference: filters.reference });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    query.skip(skip).take(take);

    // Order by creation date
    query.orderBy('payment_request.created', 'DESC');

    const entities = await query.getMany();
    return {
      data: entities.map(entity => entity.toPaymentRequest()),
      total
    };
  }

  async createPaymentRequest(paymentRequest: PaymentRequest): Promise<PaymentRequest> {
    Logger.log(`Creating payment request ${JSON.stringify(paymentRequest)}`, PaymentRequestsService.name);
    const entity = this.paymentRequestRepository.create(paymentRequest);
    const savedEntity = await this.paymentRequestRepository.save(entity);
    return savedEntity.toPaymentRequest();
  }
} 