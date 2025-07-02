import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Merchant, ProviderCredential } from './accounts';
import { PaymentMethod } from '../payment/payment-method';

export class PaymentConfiguration {
  @IsString()
  @IsOptional()
  id?: string;

  @ValidateNested()
  @Type(() => Merchant)
  @IsNotEmpty()
  merchant!: Merchant;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsNotEmpty()
  isDefault!: boolean;

  @ValidateNested({ each: true })
  @Type(() => RoutingRule)
  @IsOptional()
  routingRules?: RoutingRule[];

  @IsDate()
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @IsOptional()
  updatedAt?: Date;
} 

export class RoutingRule {
    @IsString()
    @IsOptional()
    id?: string;
  
    @ValidateNested()
    @Type(() => ProviderCredential)
    @IsNotEmpty()
    providerCredential!: ProviderCredential;
  
    @ValidateNested()
    @Type(() => PaymentConfiguration)
    @IsNotEmpty()
    paymentConfiguration!: PaymentConfiguration;
  
    @IsEnum(PaymentMethod)
    @IsOptional()
    paymentMethod?: PaymentMethod;
  
    @IsNumber()
    @IsOptional()
    weight?: number;
  
    @IsBoolean()
    @IsNotEmpty()
    isActive!: boolean;
  
    @IsDate()
    @IsOptional()
    updatedAt?: Date;
  }
  