import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetProviderCredentialsDto {
  @ApiProperty({
    description: 'Code of the provider',
    example: 'stripe',
    required: false,
  })
  @IsString()
  @IsOptional()
  providerCode?: string;

  @ApiProperty({
    description: 'ID of the provider',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  providerId?: string;

} 