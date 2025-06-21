import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProviderCredential } from './provider-credential.entity';
import { AccountStatus } from '@fugata/shared';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'account_code' })
  accountCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: AccountStatus,  nullable: true })
  status: AccountStatus;

  @OneToMany(() => ProviderCredential, providerCredential => providerCredential.provider)
  providerCredentials: ProviderCredential[];
  
  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 