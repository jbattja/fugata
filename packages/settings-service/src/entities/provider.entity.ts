import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProviderCredential } from './provider-credential.entity';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, name: 'provider_code' })
  providerCode: string;

  @OneToMany(() => ProviderCredential, providerCredential => providerCredential.provider)
  providerCredentials: ProviderCredential[];
  
  @Column('jsonb', { nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 