import { Merchant, ProviderCredential } from "../settings/accounts";
import { Amount } from "./amount";
import { Customer } from "./customer";
import { CaptureMethod, OrderLine, PaymentType } from "./payment-common";
import { PaymentInstrument } from "./payment-instrument";

export enum PaymentStatus {
    INITIATED = 'Initiated',
    AUTHORIZATION_PENDING = 'Authorization Pending',
    AUTHORIZED = 'Authorized',
    REFUSED = 'Refused',
    PARTIALLY_CAPTURED = 'Partially Captured',
    CAPTURED = 'Captured',
    VOIDED = 'Voided',
    REVERSED = 'Reversed',
    REFUNDED = 'Refunded'
}

export enum SettlementStatus {
    PARTIALLY_SETTLED = 'Partially Settled',
    SETTLED = 'Settled',
    REFUND_SETTLED = 'Refund Settled',
    SETTLEMENT_REVERSED = 'Settlement Reversed'
}

export enum ChargebackStatus {
    INQUIRED = 'Inquired',
    CHARGED_BACK = 'Charged back',
    CHARGEBACK_REVERSED = 'Chargeback Reversed'
}

export class Payment {
    id: string;
    merchant: Merchant;
    providerCredential: ProviderCredential;
    customer: Customer;
    amount: Amount;
    reference: string;
    description: string;
    paymentInstrument: PaymentInstrument;
    paymentType: PaymentType;
    captureMethod: CaptureMethod;
    returnUrl: string;
    deviceFingerprint: string;
    authenticationData: string;
    orderLines: OrderLine[];
    status: PaymentStatus;
    settlementStatus: SettlementStatus;
    chargebackStatus: ChargebackStatus;
    refusalReason: string;
    metadata: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}
