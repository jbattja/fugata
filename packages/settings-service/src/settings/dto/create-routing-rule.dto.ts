import { IsString, IsNotEmpty, IsObject, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoutingRuleDto {
  @ApiProperty({
    description: 'Code of the merchant',
    example: 'acme-corp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Merchant code is required' })
  merchantCode: string;

  @ApiProperty({
    description: 'Code for the provider credential',
    example: 'stripe-acme-corp-live',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider credential code is required' })
  providerCredentialCode: string;

  @ApiProperty({
    description: 'Conditions for the routing rule',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  conditions: Record<string, any>;

  @ApiProperty({
    description: 'Weight for the routing rule',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  weight: number;

} 