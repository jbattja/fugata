import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { CardNetwork, PaymentMethod } from '@fugata/shared';

@Entity('card_tokens')
export class CardToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: string;

  @Column({ name: 'customer_id', nullable: true })
  @Index()
  customerId?: string;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'card_network', type: 'enum', enum: CardNetwork, nullable: true })
  cardNetwork?: CardNetwork;

  // Encrypted card data
  @Column({ name: 'encrypted_card_number' })
  encryptedCardNumber: string;

  @Column({ name: 'encrypted_card_holder_name', nullable: true })
  encryptedCardHolderName?: string;

  // Masked data for display (not encrypted)
  @Column({ name: 'masked_number' })
  maskedNumber: string;

  @Column({ name: 'bin' })
  bin: string;

  @Column({ name: 'last4' })
  last4: string;

  @Column({ name: 'expiry_month' })
  expiryMonth: number;

  @Column({ name: 'expiry_year' })
  expiryYear: number;

  @Column({ name: 'issuer_name', nullable: true })
  issuerName?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;
}
