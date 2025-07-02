import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@fugata/shared';

export class CreateRoutingRuleDto {
  @ApiProperty({
    description: 'ID of the payment configuration',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty({ message: 'Payment configuration ID is required' })
  paymentConfigurationId: string;

  @ApiProperty({
    description: 'Code for the provider credential',
    example: 'stripe-acme-corp-live',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider credential code is required' })
  providerCredentialCode: string;

  @ApiProperty({
    description: 'Payment method for the routing rule',
    example: 'CARD',
    required: false,
  })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Weight for the routing rule',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  weight: number;

} 