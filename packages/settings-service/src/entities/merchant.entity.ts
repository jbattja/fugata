import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProviderCredential } from './provider-credential.entity';
import { RoutingRule } from './routing-rule.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, name: 'merchant_code' })
  merchantCode: string;

  @OneToMany(() => RoutingRule, rule => rule.merchant)
  routingRules: RoutingRule[];

  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 