import { PaymentStatus } from "@fugata/shared";
import { FraudAdvice, PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";

export class FraudScoreAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Fraudscore action');

        // TODO: Call fraud score service, for now we mock it based on the customer name

        if (context.payment.customer?.customerName?.toLowerCase() === 'fraud') {
            context.fraud = {
                score: 100,
                advice: FraudAdvice.REJECT
            };
        } else if (context.payment.customer?.customerName?.toLowerCase() === 'challenge'
            || context.payment.customer?.customerName?.toLowerCase() === 'frictionless') {
            context.fraud = {
                score: 50,
                advice: FraudAdvice.CHALLENGE
            };
        } else {
            context.fraud = {
                score: 0,
                advice: FraudAdvice.APPROVE
            };
        }

        if (context.fraud.advice === FraudAdvice.REJECT) {
            context.payment.status = PaymentStatus.REFUSED;
            context.payment.refusalReason = "Fraud";
        }
        this.log('Fraudscore action completed', context.fraud);
        return context;
    }
} 