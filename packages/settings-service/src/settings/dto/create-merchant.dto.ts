import { IsString, IsNotEmpty, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@fugata/shared';

export class CreateMerchantDto {
  @ApiProperty({
    description: 'Unique code for the merchant',
    example: 'acme-corp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Account code is required' })
  accountCode: string;

  @ApiProperty({
    description: 'Description of the merchant',
    example: 'Acme Corp',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'Status of the merchant',
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