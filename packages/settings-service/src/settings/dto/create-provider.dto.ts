import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Name of the provider',
    example: 'Stripe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    description: 'Unique code for the provider',
    example: 'stripe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Provider code is required' })
  providerCode: string;
} 