import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderCredentialDto {
  @ApiProperty({
    description: 'Unique code for the provider credential',
    example: 'stripe-acme-corp-live',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider credential code is required' })
  providerCredentialCode: string;

  @ApiProperty({
    description: 'Code of the provider',
    example: 'stripe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider code is required' })
  providerCode: string;

  @ApiProperty({
    description: 'Whether this credential is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Settings for the provider credential',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
} 