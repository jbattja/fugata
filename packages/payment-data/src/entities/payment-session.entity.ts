import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentSession, SessionStatus, PaymentType } from '@fugata/shared';

@Entity('payment_sessions')
export class PaymentSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', unique: true })
  sessionId: string;

  @Column({ nullable: true })
  url: string;

  @Column('jsonb', { nullable: true })
  amount: any;

  @Column('jsonb', { nullable: true })
  customer: any;

  @Column({ nullable: true })
  reference: string;

  @Column('jsonb', { name: 'payment_type', nullable: true })
  paymentType: any;

  @Column({ name: 'return_url', nullable: true })
  returnUrl: string;

  @Column('jsonb', { name: 'order_lines', nullable: true })
  orderLines: any[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, string>;

  @Column({ name: 'merchant_code', nullable: true })
  merchantCode: string;

  @Column('jsonb', { name: 'session_details', nullable: true })
  sessionDetails: any;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    nullable: true
  })
  status: SessionStatus;

  @Column({ name: 'refusal_reason', nullable: true })
  refusalReason: string;

  @CreateDateColumn({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: "timestamp", nullable: true })
  expiresAt: Date;

  toPaymentSession(): PaymentSession {
    return new PaymentSession({
      sessionId: this.sessionId,
      url: this.url,
      amount: this.amount,
      customer: this.customer,
      reference: this.reference,
      paymentType: this.paymentType,
      returnUrl: this.returnUrl,
      orderLines: this.orderLines,
      metadata: this.metadata,
      merchantCode: this.merchantCode,
      sessionDetails: this.sessionDetails,
      status: this.status,
      refusalReason: this.refusalReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt
    });
  }
} 