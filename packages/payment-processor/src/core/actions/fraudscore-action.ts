import { PaymentStatus } from "@fugata/shared";
import { FraudAdvice, PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";

export class FraudScoreAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Fraudscore action');

        if (!context.fraud.score) {
            context.fraud.score = this.getFraudScore(context);
        }

        if (context.fraud.score === 100) {
            context.fraud.advice = FraudAdvice.REJECT;
        } else if (context.fraud.score === 50) {
            context.fraud.advice = FraudAdvice.CHALLENGE;
        } else {
            context.fraud.advice = FraudAdvice.APPROVE;
        }

        if (context.authentication?.done === true) {
            this.updateFraudScoreWithAuthenticationData(context);
        }

        if (context.fraud.advice === FraudAdvice.REJECT && context.payment.status === PaymentStatus.INITIATED) {
            context.payment.status = PaymentStatus.REFUSED;
            context.payment.refusalReason = "Fraud";
        }
        return context;
    }

    private getFraudScore(context: PaymentContext): number {
        // TODO: Call fraud score service, for now we mock it based on the customer name
        if (context.payment.customer?.customerName?.toLowerCase() === 'fraud') {
            return 100;
        } else if (context.payment.customer?.customerName?.toLowerCase() === 'challenge'
            || context.payment.customer?.customerName?.toLowerCase() === 'frictionless') {
            return 50;
        }
        return 0;
    }

    private updateFraudScoreWithAuthenticationData(context: PaymentContext): void {
        // TODO: more sophisticated rules. For now we just change the advice based on liability shift
        if (context.fraud.advice == FraudAdvice.CHALLENGE) {
            if (context.payment.authenticationData && context.payment.authenticationData.liabilityShifted === true) {
            context.fraud.advice = FraudAdvice.APPROVE; 
            } else {
                context.fraud.advice = FraudAdvice.REJECT;
            }
        }
    }
} 