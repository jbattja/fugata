import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@fugata/shared';

export class CreateProviderCredentialDto {
  @ApiProperty({
    description: 'Unique code for the provider credential',
    example: 'stripe-acme-corp-live',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider credential code is required' })
  accountCode: string;

  @ApiProperty({
    description: 'Description of the provider credential',
    example: 'Stripe credential for Acme Corp',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Status of the provider credential',
    example: 'Active',
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status: AccountStatus;

  @ApiProperty({
    description: 'Code of the provider',
    example: 'stripe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider code is required' })
  providerCode: string;

  @ApiProperty({
    description: 'Settings for the provider credential',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
} 