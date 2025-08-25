import { IsString, IsEnum, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { PaymentMethod, CardNetwork } from '@fugata/shared';

export class CreateCardTokenDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(CardNetwork)
  @IsOptional()
  cardNetwork?: CardNetwork;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsOptional()
  cvc?: string;

  @IsString()
  @IsOptional()
  cardHolderName?: string;

  @IsNumber()
  expiryMonth: number;

  @IsNumber()
  expiryYear: number;
}

export class TokenResponseDto {
  token: string;
  maskedNumber: string;
  bin: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardNetwork?: CardNetwork;
  issuerName?: string;
  country?: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export class DecryptTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  merchantId: string;
}

export class DecryptedCardDataDto {
  cardNumber: string;
  cardHolderName?: string;
  expiryMonth: number;
  expiryYear: number;
}
