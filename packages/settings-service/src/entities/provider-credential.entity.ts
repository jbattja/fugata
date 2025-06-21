import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Provider } from './provider.entity';
import { AccountStatus } from '@fugata/shared';

@Entity('provider_credentials')
export class ProviderCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_code', unique: true })
  accountCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: AccountStatus,  nullable: true })
  status: AccountStatus;

  @ManyToOne(() => Provider, provider => provider.providerCredentials)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 