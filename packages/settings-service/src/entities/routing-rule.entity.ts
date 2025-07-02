import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProviderCredential } from './provider-credential.entity';
import { PaymentConfiguration } from './payment-configuration.entity';
import { PaymentMethod } from '@fugata/shared';

@Entity('routing_rules')
export class RoutingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderCredential)
  @JoinColumn({ name: 'provider_credential_id' })
  providerCredential: ProviderCredential;

  @Column({ name: 'provider_credential_id' })
  providerCredentialId: string;

  @ManyToOne(() => PaymentConfiguration, config => config.routingRules, { nullable: false })
  @JoinColumn({ name: 'payment_configuration_id' })
  paymentConfiguration: PaymentConfiguration;

  @Column({ name: 'payment_configuration_id', nullable: false })
  paymentConfigurationId: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ type: 'float', default: 1.0 })
  weight: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 