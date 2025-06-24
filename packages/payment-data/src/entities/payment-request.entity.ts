import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentRequest, PaymentMethod, PaymentRequestStatus, CaptureMethod } from '@fugata/shared'

@Entity('payment_requests')
export class PaymentRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fugata_reference', nullable: true, unique: true })
  fugataReference: string;

  @Column('jsonb', { nullable: true })
  amount: any;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true
  })
  paymentMethod: PaymentMethod;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ name: 'return_url', nullable: true })
  returnUrl: string;

  @Column('jsonb', { nullable: true })
  customer: any;

  @Column({
    name: 'capture_method',
    type: 'enum',
    enum: CaptureMethod,
    nullable: true
  })
  captureMethod: CaptureMethod;

  @Column({ name: 'provider_credential_code', nullable: true })
  providerCredentialCode: string;

  @Column({ name: 'provider_code', nullable: true })
  providerCode: string;

  @Column({ name: 'merchant_code', nullable: true })
  merchantCode: string;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference: string;

  @Column({
    type: 'enum',
    enum: PaymentRequestStatus,
    nullable: true
  })
  status: PaymentRequestStatus;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Column({ name: 'next_action_details', type: 'jsonb', nullable: true })
  nextActionDetails: any;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created: Date;

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updated: Date;

  toPaymentRequest(): PaymentRequest {
    return new PaymentRequest({
      id: this.id,
      fugataReference: this.fugataReference,
      amount: this.amount,
      paymentMethod: this.paymentMethod,
      description: this.description,
      reference: this.reference,
      returnUrl: this.returnUrl,
      customer: this.customer,
      captureMethod: this.captureMethod,
      providerCredentialCode: this.providerCredentialCode,
      providerCode: this.providerCode,
      merchantCode: this.merchantCode,
      providerReference: this.providerReference,
      status: this.status,
      failureReason: this.failureReason,
      created: this.created,
      nextActionDetails: this.nextActionDetails,
      metadata: this.metadata
    });
  }
} 