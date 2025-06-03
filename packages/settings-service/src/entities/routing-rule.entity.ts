import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Merchant } from './merchant.entity';
import { ProviderCredential } from './provider-credential.entity';

@Entity('routing_rules')
export class RoutingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Merchant, merchant => merchant.routingRules)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column({ name: 'merchant_id' })
  merchantId: string;

  @ManyToOne(() => ProviderCredential)
  @JoinColumn({ name: 'provider_credential_id' })
  providerCredential: ProviderCredential;

  @Column({ name: 'provider_credential_id' })
  providerCredentialId: string;

  @Column('jsonb', { nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'float', default: 1.0 })
  weight: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 