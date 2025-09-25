import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export enum ThreeDSecureMode {
    THREE_DS_DYNAMIC = 'DYNAMIC', // Dynamic 3DS
    THREE_DS_REQUIRE = 'REQUIRE', // Require 3DS
    THREE_DS_SKIP = 'SKIP' // Skip 3DS
}

export enum AuthenticationFlow {
    CHALLENGE = 'CHALLENGE',
    FRICTIONLESS = 'FRICTIONLESS',
    EXEMPTED = 'EXEMPTED'
}

export enum ExemptionReason {
    LOW_VALUE = 'LOW_VALUE',
    LOW_RISK = 'LOW_RISK',
    SECURE_CORPORATE = 'SECURE_CORPORATE',
    TRUSTED_BENEFICIARY = 'TRUSTED_BENEFICIARY'
}

export class AuthenticationData {
    @IsString()
    @IsOptional()
    paymentInstrumentId?: string;
    
    @IsEnum(ThreeDSecureMode)
    @IsOptional()
    threeDSecureMode?: ThreeDSecureMode;

    @IsEnum(AuthenticationFlow)
    @IsOptional()
    authenticationFlow?: AuthenticationFlow;

    @IsEnum(ExemptionReason)
    @IsOptional()
    exemptionReason?: ExemptionReason;

    @IsString()
    @IsOptional()
    eci?: string;

    @IsString()
    @IsOptional()
    @IsBoolean()
    liabilityShifted?: boolean;

    @IsString()
    @IsOptional()
    version?: string;

    @IsString()
    @IsOptional()
    transactionId?: string;

    @IsString()
    @IsOptional()
    cavv?: string;
}


