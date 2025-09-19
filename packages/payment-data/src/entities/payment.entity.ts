import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Payment, PaymentStatus, PaymentSettlementStatus, PaymentChargebackStatus, Merchant, ProviderCredential, Customer, Amount, PaymentInstrument, PaymentType, CaptureMethod, AuthorizationData, OrderLine, Action, AuthenticationData } from '@fugata/shared';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_id', unique: true })
  paymentId: string;

  @Column('jsonb', { nullable: true })
  merchant: Partial<Merchant>;

  @Column('jsonb', { name: 'provider_credential', nullable: true })
  providerCredential: Partial<ProviderCredential>;

  @Column('jsonb', { nullable: true })
  customer: Customer;

  @Column('jsonb', { nullable: true })
  amount: Amount;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { name: 'payment_instrument', nullable: true })
  paymentInstrument: PaymentInstrument;

  @Column('jsonb', { name: 'payment_type', nullable: true })
  paymentType: PaymentType;

  @Column({ name: 'capture_method', nullable: true })
  captureMethod: CaptureMethod;

  @Column({ name: 'return_url', nullable: true })
  returnUrl: string;

  @Column({ name: 'device_fingerprint', nullable: true })
  deviceFingerprint: string;

  @Column('jsonb', { name: 'authentication_data', nullable: true })
  authenticationData: AuthenticationData;

  @Column('jsonb', { name: 'authorization_data', nullable: true })
  authorizationData: AuthorizationData;

  @Column('jsonb', { name: 'order_lines', nullable: true })
  orderLines: OrderLine[];

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    nullable: true
  })
  status: PaymentStatus;

  @Column('jsonb', { nullable: true })
  actions: Action[];

  @Column({
    type: 'enum',
    enum: PaymentSettlementStatus,
    name: 'settlement_status',
    nullable: true
  })
  settlementStatus: PaymentSettlementStatus;

  @Column({
    type: 'enum',
    enum: PaymentChargebackStatus,
    name: 'chargeback_status',
    nullable: true
  })
  chargebackStatus: PaymentChargebackStatus;

  @Column({ name: 'refusal_reason', nullable: true })
  refusalReason: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, string>;

  @Column({ name: 'session_id', nullable: true })
  sessionId: string;

  @Column({ name: 'partner_reference', nullable: true })
  partnerReference: string;

  @CreateDateColumn({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updatedAt: Date;

  toPayment(): Payment {
    return new Payment({
      paymentId: this.paymentId,
      merchant: this.merchant,
      providerCredential: this.providerCredential,
      customer: this.customer,
      amount: this.amount,
      reference: this.reference,
      description: this.description,
      paymentInstrument: this.paymentInstrument,
      paymentType: this.paymentType,
      captureMethod: this.captureMethod,
      returnUrl: this.returnUrl,
      deviceFingerprint: this.deviceFingerprint,
      authenticationData: this.authenticationData,
      authorizationData: this.authorizationData,
      orderLines: this.orderLines,
      status: this.status,
      actions: this.actions,
      settlementStatus: this.settlementStatus,
      chargebackStatus: this.chargebackStatus,
      refusalReason: this.refusalReason,
      metadata: this.metadata,
      sessionId: this.sessionId,
      partnerReference: this.partnerReference,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }
}
