import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';

@Entity('provider_credentials')
export class ProviderCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_credential_code', unique: true })
  providerCredentialCode: string;

  @ManyToOne(() => Provider, provider => provider.providerCredentials)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 