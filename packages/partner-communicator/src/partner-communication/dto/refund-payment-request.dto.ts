import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Refund, Payment } from '@fugata/shared';

export class RefundPaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsObject()
  @IsNotEmpty()
  refund!: Refund;

  @IsObject()
  @IsNotEmpty()
  payment!: Payment;

  @IsObject()
  @IsOptional()
  partnerConfig?: Record<string, any>;
}
