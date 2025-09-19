import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { Payment } from '@fugata/shared';

export class ConfirmPaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsObject()
  @IsNotEmpty()
  payment!: Payment;

  @IsObject()
  @IsOptional()
  urlParams?: Record<string, any>;

  @IsObject()
  @IsOptional()
  partnerConfig?: Record<string, any>;
}
