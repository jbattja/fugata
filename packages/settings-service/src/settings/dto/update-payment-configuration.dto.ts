import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePaymentConfigurationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
} 