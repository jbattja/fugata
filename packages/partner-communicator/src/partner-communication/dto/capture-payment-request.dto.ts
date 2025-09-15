import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { Capture, Payment } from '@fugata/shared';

export class CapturePaymentRequestDto {
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @IsObject()
  @IsNotEmpty()
  capture!: Capture;

  @IsObject()
  @IsNotEmpty()
  payment!: Payment;

  @IsObject()
  @IsOptional()
  partnerConfig?: Record<string, any>;
} 