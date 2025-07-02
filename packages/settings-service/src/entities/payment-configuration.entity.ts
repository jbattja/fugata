import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { RoutingRule } from './routing-rule.entity';

@Entity('payment_configurations')
export class PaymentConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Merchant, merchant => merchant.paymentConfigurations, { nullable: false })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ name: 'merchant_id', nullable: false })
  merchantId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @OneToMany(() => RoutingRule, rule => rule.paymentConfiguration)
  routingRules: RoutingRule[];

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 