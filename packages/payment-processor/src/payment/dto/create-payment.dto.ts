import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, ValidateNested, IsObject, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Amount, Customer, OrderLine, PaymentInstrument, PaymentType, CaptureMethod, AuthenticationData } from '@fugata/shared';

export class CreatePaymentDto {

  @ApiProperty({ description: 'The amount to be paid' })
  @ValidateNested()
  @Type(() => Amount)
  @IsNotEmpty({ message: 'Amount is required' })
  amount: Amount;

  @ApiProperty({ description: 'Reference for the payment' })
  @IsString()
  @IsNotEmpty({ message: 'Reference is required' })
  reference: string;

  @ApiProperty({ description: 'Customer information' })
  @ValidateNested()
  @Type(() => Customer)
  @IsOptional()
  customer: Customer;

  @ApiProperty({ description: 'Description of the payment' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'Payment instrument' })
  @ValidateNested()
  @Type(() => PaymentInstrument)
  @IsNotEmpty({ message: 'Payment instrument is required' })
  paymentInstrument: PaymentInstrument;

  @ApiProperty({ description: 'Payment type' })
  @ValidateNested()
  @Type(() => PaymentType)
  paymentType: PaymentType = new PaymentType();

  @ApiProperty({ description: 'Capture method for the payment', enum: CaptureMethod })
  @IsEnum(CaptureMethod)
  captureMethod: CaptureMethod = CaptureMethod.AUTOMATIC;

  @ApiProperty({ description: 'Return URL for the payment' })
  @IsString()
  @IsOptional()
  returnUrl: string;

  @ApiProperty({ description: 'Device fingerprint for the payment' })
  @IsString()
  @IsOptional()
  deviceFingerprint: string;

  @ApiProperty({ description: 'Authentication data for the payment' })
  @ValidateNested()
  @Type(() => AuthenticationData)
  @IsOptional()
  authenticationData: AuthenticationData;

  @ApiProperty({ description: 'Order lines for the payment' })
  @ValidateNested()
  @Type(() => OrderLine)
  @IsOptional()
  orderLines: OrderLine[];

  @ApiProperty({ description: 'Additional metadata for the payment', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;

} 