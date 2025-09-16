import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Void, Payment } from '@fugata/shared';

export class VoidPaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsObject()
  @IsNotEmpty()
  voidOperation!: Void;

  @IsObject()
  @IsNotEmpty()
  payment!: Payment;

  @IsObject()
  @IsOptional()
  partnerConfig?: Record<string, any>;
}
