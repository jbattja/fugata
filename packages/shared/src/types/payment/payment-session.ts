import { Amount } from "./amount";
import { Customer } from "./customer";
import { CaptureMethod, OrderLine, PaymentType } from "./payment-common";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Merchant } from "../settings/accounts";
import { PaymentMethod } from "./payment-method";

export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    COMPLETED = 'COMPLETED'
}

export enum SessionMode {
    COMPONENT = 'COMPONENT',
    HOSTED = 'HOSTED'
}

export class HostedPageCustomization {
    @IsString()
    @IsOptional()
    merchantDisplayName?: string;

    @IsString()
    @IsOptional()
    merchantLogo?: string;

    @IsString()
    @IsOptional()
    primaryColor?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    displayableFields?: string[];
}

export class PaymentSession {

    @IsString()
    @IsOptional()
    sessionId?: string;

    @IsString()
    @IsOptional()
    url?: string;

    @ValidateNested()
    @Type(() => Amount)
    @IsOptional()
    amount?: Amount;

    @ValidateNested()
    @Type(() => Customer)
    @IsOptional()
    customer?: Customer;

    @IsString()
    @IsNotEmpty()
    reference!: string;

    @ValidateNested()
    @Type(() => PaymentType)
    @IsOptional()
    paymentType?: PaymentType;

    @IsEnum(CaptureMethod)
    @IsNotEmpty()
    captureMethod!: CaptureMethod;

    @IsEnum(SessionMode)
    @IsNotEmpty()
    mode!: SessionMode;

    @IsString()
    @IsOptional()
    returnUrl?: string;

    @ValidateNested()
    @Type(() => OrderLine)
    @IsOptional()
    orderLines?: OrderLine[];

    @IsObject()
    @IsOptional()
    metadata?: Record<string, string>;

    @ValidateNested()
    @Type(() => Merchant)
    @IsOptional()
    merchant?: Partial<Merchant>;

    @IsArray()
    @IsEnum(PaymentMethod)
    @IsOptional()
    allowedPaymentMethods?: PaymentMethod[];

    @ValidateNested()
    @Type(() => HostedPageCustomization)
    @IsOptional()
    hostedPageCustomization?: HostedPageCustomization;

    @IsEnum(SessionStatus)
    @IsOptional()
    status?: SessionStatus;

    @IsString()
    @IsOptional()
    refusalReason?: string;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;

    @IsDate()
    @IsNotEmpty()
    expiresAt!: Date;
    
  constructor(partial: Partial<PaymentSession>) {
    Object.assign(this, partial);
  }
}

