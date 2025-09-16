import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { PaymentEvent, PaymentEventType, PaymentEventData } from '@fugata/shared';

@Entity('payment_events')
@Index(['paymentId', 'timestamp']) // Index for efficient querying by payment and time
export class PaymentEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column({
    type: 'enum',
    enum: PaymentEventType,
    name: 'event_type'
  })
  eventType: PaymentEventType;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column('jsonb')
  data: any;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  createdAt: Date;

  toPaymentEvent(): PaymentEvent {
    return {
      eventType: this.eventType,
      paymentId: this.paymentId,
      timestamp: this.timestamp.toISOString(),
      data: this.data as PaymentEventData,
      metadata: this.metadata
    };
  }
}
