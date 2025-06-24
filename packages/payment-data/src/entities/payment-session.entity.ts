import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentSession, SessionStatus, Merchant, CaptureMethod, SessionMode, PaymentMethod } from '@fugata/shared';

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

  @Column({ name: 'capture_method', nullable: true })
  captureMethod: CaptureMethod;

  @Column({ name: 'mode', nullable: true })
  mode: SessionMode;

  @Column({ name: 'return_url', nullable: true })
  returnUrl: string;

  @Column('jsonb', { name: 'order_lines', nullable: true })
  orderLines: any[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, string>;

  @Column('jsonb', { name: 'merchant', nullable: true })
  merchant: Merchant;

  @Column('jsonb', { name: 'allowed_payment_methods', nullable: true })
  allowedPaymentMethods: PaymentMethod[];

  @Column('jsonb', { name: 'hosted_page_customization', nullable: true })
  hostedPageCustomization: any;

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
      captureMethod: this.captureMethod,
      mode: this.mode,
      returnUrl: this.returnUrl,
      orderLines: this.orderLines,
      metadata: this.metadata,
      merchant: this.merchant,
      allowedPaymentMethods: this.allowedPaymentMethods,
      hostedPageCustomization: this.hostedPageCustomization,
      status: this.status,
      refusalReason: this.refusalReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt
    });
  }
} 