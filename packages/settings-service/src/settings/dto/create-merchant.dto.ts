import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({
    description: 'Name of the merchant',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Unique code for the merchant',
    example: 'acme-corp',
  })
  @IsString()
  @IsNotEmpty({ message: 'Merchant code is required' })
  merchantCode: string;

  @ApiProperty({
    description: 'Settings for the provider credential',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

} 