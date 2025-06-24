import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Merchant, ProviderCredential } from "../settings/accounts";
import { Customer } from "./customer";
import { Amount } from "./amount";
import { PaymentInstrument } from "./payment-instrument";
import { AuthorizationData, CaptureMethod, OrderLine, PaymentType } from "./payment-common";
import { AuthenticationData } from "./authentication";

export enum PaymentStatus {
    INITIATED = 'INITIATED',
    AUTHORIZATION_PENDING = 'AUTHORIZATION_PENDING',
    AUTHORIZED = 'AUTHORIZED',
    REFUSED = 'REFUSED',
    PARTIALLY_CAPTURED = 'PARTIALLY_CAPTURED',
    CAPTURED = 'CAPTURED',
    VOIDED = 'VOIDED',
    REVERSED = 'REVERSED',
    REFUNDED = 'REFUNDED'
}

export enum PaymentSettlementStatus {
    PARTIALLY_SETTLED = 'PARTIALLY_SETTLED',
    SETTLED = 'SETTLED',
    REFUND_SETTLED = 'REFUND_SETTLED',
    SETTLEMENT_REVERSED = 'SETTLEMENT_REVERSED'
}

export enum PaymentChargebackStatus {
    INQUIRED = 'INQUIRED',
    CHARGED_BACK = 'CHARGED_BACK',
    REVERSED = 'REVERSED'
}

export enum ActionType {
    REDIRECT = 'REDIRECT',
    PRESENT_QR_CODE = 'PRESENT_QR_CODE',
    PRESENT_PAYMENT_CODE = 'PRESENT_PAYMENT_CODE'
}

export enum RedirectMethod {
    GET = 'GET',
    POST = 'POST'
}

export class Action {

    @IsString()
    @IsNotEmpty()
    actionType: ActionType;

    @IsString()
    @IsOptional()
    redirectUrl: string;

    @IsEnum(RedirectMethod)
    @IsOptional()
    redirectMethod: RedirectMethod;

    @IsString()
    @IsOptional()
    qrCode: string;

    @IsString()
    @IsOptional()
    paymentCode: string;
}

export class Payment {

    @IsString()
    @IsOptional()
    paymentId: string;

    @ValidateNested()
    @Type(() => Merchant)
    @IsOptional()
    merchant: Partial<Merchant>;

    @ValidateNested()
    @Type(() => ProviderCredential)
    @IsOptional()
    providerCredential: Partial<ProviderCredential>;

    @ValidateNested()
    @Type(() => Customer)
    @IsOptional()
    customer: Customer;

    @ValidateNested()
    @Type(() => Amount)
    @IsOptional()
    amount: Amount;

    @IsString()
    @IsOptional()
    reference: string;

    @IsString()
    @IsOptional()
    description: string;

    @ValidateNested()
    @Type(() => PaymentInstrument)
    @IsOptional()
    paymentInstrument: PaymentInstrument;

    @ValidateNested()
    @Type(() => PaymentType)
    @IsOptional()
    paymentType: PaymentType;

    @IsEnum(CaptureMethod)
    @IsOptional()
    captureMethod: CaptureMethod;

    @IsString()
    @IsOptional()
    returnUrl: string;

    @IsString()
    @IsOptional()
    deviceFingerprint: string;

    @IsString()
    @IsOptional()
    authenticationData: AuthenticationData;

    @ValidateNested()
    @Type(() => AuthorizationData)
    @IsOptional()
    authorizationData: AuthorizationData;

    @ValidateNested()
    @Type(() => OrderLine)
    @IsOptional()
    orderLines: OrderLine[];

    @IsEnum(PaymentStatus)
    @IsOptional()
    status: PaymentStatus;

    @ValidateNested()
    @Type(() => Action)
    @IsOptional()
    actions: Action[];

    @IsEnum(PaymentSettlementStatus)
    @IsOptional()
    settlementStatus: PaymentSettlementStatus;

    @IsEnum(PaymentChargebackStatus)
    @IsOptional()
    chargebackStatus: PaymentChargebackStatus;

    @IsString()
    @IsOptional()
    refusalReason: string;

    @IsObject()
    @IsOptional()
    metadata: Record<string, string>;

    @IsDate()
    @IsOptional()
    createdAt: Date;

    @IsDate()
    @IsOptional()
    updatedAt: Date;

    constructor(partial: Partial<Payment>) {
        Object.assign(this, partial);
      }

    addAction(action: Action) {
        if (!this.actions) {
            this.actions = [];
        }
        this.actions.push(action);
    }
    
}
