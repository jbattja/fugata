import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, ValidateNested, IsArray, IsObject, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { Amount, Customer, OrderLine, PaymentMethod, PaymentType, CaptureMethod } from '@fugata/shared';

export class CreateSessionDto {
  @ApiProperty({ description: 'The amount to be paid' })
  @ValidateNested()
  @Type(() => Amount)
  amount: Amount;

  @ApiProperty({ description: 'Customer information' })
  @ValidateNested()
  @Type(() => Customer)
  @IsOptional()
  customer: Customer;

  @ApiProperty({ description: 'Reference number for the payment' })
  @IsString()
  reference: string;

  @ApiProperty({ description: 'Type of payment' })
  @ValidateNested()
  @Type(() => PaymentType)
  @IsOptional()
  paymentType: PaymentType;

  @ApiProperty({ description: 'Capture method for the payment', enum: CaptureMethod })
  @IsEnum(CaptureMethod)
  @IsOptional()
  captureMethod: CaptureMethod;

  @ApiProperty({ description: 'URL to return to after payment completion' })
  @IsString()
  returnUrl: string;

  @ApiProperty({ description: 'Order line items', type: [OrderLine] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLine)
  @IsOptional()
  orderLines: OrderLine[];

  @ApiProperty({ description: 'Additional metadata for the session', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

  @ApiProperty({ 
    description: 'Allowed payment methods for this session',
    enum: PaymentMethod,
    isArray: true,
    enumName: 'PaymentMethod'
  })
  @IsArray()
  @IsEnum(PaymentMethod, { each: true })
  @IsOptional()
  allowedPaymentMethods: PaymentMethod[];

  @ApiProperty({ description: 'Session expiration date' })
  @IsDate()
  @IsOptional()
  expiresAt: Date;
} 