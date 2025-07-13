import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Payment } from '@fugata/shared';

export class AuthorizePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsObject()
  @IsNotEmpty()
  payment!: Payment;

  @IsObject()
  @IsOptional()
  partnerConfig?: Record<string, any>;
} 