import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment ID to confirm' })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({ description: 'Partner name' })
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @ApiProperty({ description: 'URL parameters from partner redirect', required: false })
  @IsObject()
  @IsOptional()
  urlParams?: Record<string, any>;
}
