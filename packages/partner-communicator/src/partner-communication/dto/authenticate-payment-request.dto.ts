import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { Payment } from '@fugata/shared';

export class AuthenticatePaymentRequestDto {
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
