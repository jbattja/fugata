import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../payment/payment-method';

export class PaymentConfiguration {
  @IsString()
  @IsOptional()
  id?: string;

  @ValidateNested()
  @Type(() => require('./accounts').Merchant)
  @IsNotEmpty()
  merchant!: any;

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
    @Type(() => require('./accounts').ProviderCredential)
    @IsNotEmpty()
    providerCredential!: any;
  
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
  