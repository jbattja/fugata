import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RoutingRule } from './routing-rule.entity';
import { AccountStatus, ProviderCredential } from '@fugata/shared';
import { ApiCredential } from './api-credential.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, name: 'account_code' })
  accountCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: AccountStatus,  nullable: true})
  status: AccountStatus;

  @OneToMany(() => RoutingRule, rule => rule.merchant)
  routingRules: RoutingRule[];

  @OneToMany(() => ApiCredential, apiCredential => apiCredential.merchant)
  apiCredentials: ApiCredential[];

  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 