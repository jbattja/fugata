import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ApiCredentialStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class ApiKey {
  @Column()
  apiHash: string;

  @Column({ nullable: true })
  expiryDate: Date;
}

@Entity('api_credentials')
export class ApiCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  merchantId: string;

  @Column()
  name: string;

  @CreateDateColumn()
  created: Date;

  @Column({
    type: 'enum',
    enum: ApiCredentialStatus,
    default: ApiCredentialStatus.ACTIVE
  })
  status: ApiCredentialStatus;

  @Column('simple-array', { nullable: true })
  allowedIpRange: string[];

  @Column('jsonb')
  apiKeys: ApiKey[];

  @UpdateDateColumn()
  updatedAt: Date;
} 