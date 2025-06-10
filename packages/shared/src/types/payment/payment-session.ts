import { Amount } from "./amount";
import { Customer } from "./customer";
import { CaptureMethod, OrderLine, PaymentType } from "./payment-common";
import { IsDate, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export enum SessionStatus {
    ACTIVE = 'Active',
    PENDING = 'Pending',
    EXPIRED = 'Expired',
    CANCELLED = 'Cancelled',
    FAILED = 'Failed',
    COMPLETED = 'Completed'
}

export class SessionDetails {
    merchantDisplayName: string;
    merchantLogo: string;
    primaryColor: string;
    displayableFields: string[];
}

export class PaymentSession {

    @IsString()
    @IsOptional()
    sessionId: string;

    @IsString()
    @IsOptional()
    url: string;

    @ValidateNested()
    @Type(() => Amount)
    @IsOptional()
    amount: Amount;

    @ValidateNested()
    @Type(() => Customer)
    @IsOptional()
    customer: Customer;

    @IsString()
    reference: string;

    @ValidateNested()
    @Type(() => PaymentType)
    @IsOptional()
    paymentType: PaymentType;

    @IsEnum(CaptureMethod)
    @IsOptional()
    returnUrl: string;

    @ValidateNested()
    @Type(() => OrderLine)
    @IsOptional()
    orderLines: OrderLine[];

    @IsObject()
    @IsOptional()
    metadata: Record<string, string>;

    @IsOptional()
    @IsString()
    merchantCode?: string;

    @ValidateNested()
    @Type(() => SessionDetails)
    @IsOptional()
    sessionDetails: SessionDetails;

    @IsEnum(SessionStatus)
    @IsOptional()
    status: SessionStatus;

    @IsString()
    @IsOptional()
    refusalReason: string;

    @IsDate()
    @IsOptional()
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt: Date;

    @IsDate()
    @IsOptional()
    expiresAt: Date;
    
  constructor(partial: Partial<PaymentSession>) {
    Object.assign(this, partial);
  }
}

