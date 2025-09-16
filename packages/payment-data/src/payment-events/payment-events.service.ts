import { Injectable } from '@nestjs/common';
import { SharedLogger } from '@fugata/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEventEntity } from '../entities/payment-event.entity';
import { PaymentEvent, Payment } from '@fugata/shared';

@Injectable()
export class PaymentEventsService {
  constructor(
    @InjectRepository(PaymentEventEntity)
    private readonly paymentEventRepository: Repository<PaymentEventEntity>
  ) {}

  async storeEvent(event: PaymentEvent): Promise<void> {
    const entity = this.paymentEventRepository.create({
      paymentId: event.paymentId,
      eventType: event.eventType,
      timestamp: new Date(event.timestamp),
      data: event.data,
      metadata: event.metadata
    });

    await this.paymentEventRepository.save(entity);
    SharedLogger.log(`Stored payment event: ${event.eventType} for payment ${event.paymentId}`, undefined, PaymentEventsService.name);
  }

  async getEventsForPayment(paymentId: string, fromTimestamp?: Date): Promise<PaymentEvent[]> {
    const query = this.paymentEventRepository
      .createQueryBuilder('event')
      .where('event.paymentId = :paymentId', { paymentId })
      .orderBy('event.timestamp', 'ASC');

    if (fromTimestamp) {
      query.andWhere('event.timestamp >= :fromTimestamp', { fromTimestamp });
    }

    const entities = await query.getMany();
    return entities.map(entity => entity.toPaymentEvent());
  }

  async getLatestEventForPayment(paymentId: string): Promise<PaymentEvent | null> {
    const entity = await this.paymentEventRepository
      .createQueryBuilder('event')
      .where('event.paymentId = :paymentId', { paymentId })
      .orderBy('event.timestamp', 'DESC')
      .getOne();

    return entity ? entity.toPaymentEvent() : null;
  }

  async replayEventsForPayment(paymentId: string, fromTimestamp?: Date): Promise<Payment> {
    const events = await this.getEventsForPayment(paymentId, fromTimestamp);
    
    if (events.length === 0) {
      throw new Error(`No events found for payment ${paymentId}`);
    }

    // Start with the first event's payment data
    let currentPayment = events[0].data.payment;

    // Apply each subsequent event
    for (let i = 1; i < events.length; i++) {
      const event = events[i];
      currentPayment = {
        ...currentPayment,
        ...event.data.payment,
        updatedAt: new Date(event.timestamp)
      };
    }

    return currentPayment;
  }
}
