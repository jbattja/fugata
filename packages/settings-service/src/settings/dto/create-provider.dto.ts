import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@fugata/shared';

export class CreateProviderDto {

  @ApiProperty({
    description: 'Unique code for the provider',
    example: 'stripe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider code is required' })
  accountCode: string;

  @ApiProperty({
    description: 'Description of the provider',
    example: 'Stripe',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Status of the provider',
    example: 'Active',
  })
  @IsEnum(AccountStatus)
  @IsOptional()
  status: AccountStatus;

  @ApiProperty({
    description: 'Settings for the provider credential',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

} 