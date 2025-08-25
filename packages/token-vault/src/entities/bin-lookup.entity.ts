import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { CardNetwork } from '@fugata/shared';

@Entity('bin_lookups')
export class BinLookup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  bin: string;

  @Column({ name: 'card_network', type: 'enum', enum: CardNetwork })
  cardNetwork: CardNetwork;

  @Column({ name: 'issuer_name' })
  issuerName: string;

  @Column({ name: 'card_type' })
  cardType: string; // 'credit', 'debit', 'prepaid'

  @Column({ name: 'card_category' })
  cardCategory: string; // 'classic', 'gold', 'platinum', etc.

  @Column({ name: 'country_code' })
  countryCode: string;

  @Column({ name: 'country_name' })
  countryName: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName?: string;

  @Column({ name: 'bank_website', nullable: true })
  bankWebsite?: string;

  @Column({ name: 'bank_phone', nullable: true })
  bankPhone?: string;

  @Column({ name: 'is_prepaid', default: false })
  isPrepaid: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
