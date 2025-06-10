import { RecurringUsage } from "./payment-common";
import { PaymentMethod } from "./payment-method";

export class PaymentInstrument {
    paymentInstrumentId: string;
    isEnabled: boolean;
    recurringUsage: RecurringUsage;
    customerId: string;
    type: PaymentMethod;
    instrumentDetails: PaymentInstrumentDetails;
    tokens: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

export abstract class PaymentInstrumentDetails {}

export class CardDetails extends PaymentInstrumentDetails {
    cardNetworkDetails: CardNetworkDetails;
    maskedNumber: string;
    bin: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    cardHolderName: string;
    issuerName: string;
    country: string;
    number: string;
    cvc: string;
}

export class CardNetworkDetails {
    network: string;
    networkToken: string;
    networkTransactionReference: string;
}
