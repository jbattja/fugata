import { Type } from "class-transformer";
import { RecurringUsage } from "./payment-common";
import { CardNetwork, PaymentMethod } from "./payment-method";
import { IsString, IsEnum, ValidateNested, IsObject, IsDate, IsOptional, IsNumber, IsNotEmpty } from "class-validator";
import { Payment } from "./payment";

export enum PaymentInstrumentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

// Define the abstract class first
export abstract class PaymentInstrumentDetails {}

export class CardNetworkDetails {
    @IsEnum(CardNetwork)
    network!: CardNetwork;

    @IsString()
    @IsOptional()
    networkToken?: string;

    @IsString()
    @IsOptional()
    networkTransactionReference?: string;
}

export class CardDetails extends PaymentInstrumentDetails {
    @ValidateNested()
    @Type(() => CardNetworkDetails)
    @IsOptional()
    cardNetworkDetails?: CardNetworkDetails;

    @IsString()
    @IsOptional()
    maskedNumber?: string;

    @IsString()
    @IsOptional()
    bin?: string;

    @IsString()
    @IsOptional()
    last4?: string;

    @IsNumber()
    @IsOptional()
    expiryMonth?: number;

    @IsNumber()
    @IsOptional()
    expiryYear?: number;

    @IsString()
    @IsOptional()
    cardHolderName?: string;

    @IsString()
    @IsOptional()
    issuerName?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsNumber()
    @IsOptional()
    number?: number;

    @IsString()
    @IsOptional()
    cvc?: string;
}

export class PaymentInstrument {
    @IsString()
    @IsOptional()
    paymentInstrumentId?: string;

    @IsEnum(PaymentInstrumentStatus)
    @IsOptional()
    status?: PaymentInstrumentStatus;

    @IsEnum(RecurringUsage)
    @IsOptional()
    recurringUsage?: RecurringUsage;

    @IsString()
    @IsOptional()
    customerId?: string;

    @IsEnum(PaymentMethod)
    @IsNotEmpty({ message: 'Payment method is required' })
    paymentMethod!: PaymentMethod;

    @ValidateNested()
    @Type(() => PaymentInstrumentDetails)
    @IsOptional()
    instrumentDetails?: PaymentInstrumentDetails;

    @IsObject() 
    @IsOptional()
    tokens?: Record<string, string>;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;
}

export function validatePaymentInstrument(paymentInstrument: PaymentInstrument, payment: Payment) {
    if (paymentInstrument.paymentInstrumentId && paymentInstrument.instrumentDetails) {
        throw new Error('Payment instrument id and instrument details cannot be provided together');
    }
    if (paymentInstrument.paymentInstrumentId) {
        // lookup payment instrument in database
        return;
    }
    if (!paymentInstrument.recurringUsage) {
        paymentInstrument.recurringUsage = payment.paymentType?.recurringUsage ?? RecurringUsage.NONE;
    }
}
