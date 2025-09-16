import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { OperationType, OperationStatus } from '@fugata/shared';

@Entity('operations')
@Index(['paymentId', 'operationType']) // Index for efficient querying by payment and operation type
@Index(['operationId']) // Index for efficient querying by operation ID
export class OperationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_id', unique: true })
  operationId: string;

  @Column({
    type: 'enum',
    enum: OperationType,
    name: 'operation_type'
  })
  operationType: OperationType;

  @Column({ name: 'payment_id' })
  paymentId: string;

  @Column('jsonb', { nullable: true })
  amount: any;

  @Column({ nullable: true })
  reference: string;

  @Column({
    type: 'enum',
    enum: OperationStatus,
    nullable: true
  })
  status: OperationStatus;

  @Column({ name: 'refusal_reason', nullable: true })
  refusalReason: string;

  @CreateDateColumn({ name: 'created_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  updatedAt: Date;
}
