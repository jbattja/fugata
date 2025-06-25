import { PaymentStatus } from "@fugata/shared";
import { FraudAdvice, PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";

export class FraudScoreAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Fraudscore action');
        // TODO: Call fraud score service
        const score = Math.floor(Math.random() * 100);
        context.fraud = {
            score: score,
            advice: score < 50 ? FraudAdvice.APPROVE :
                score < 75 ? FraudAdvice.CHALLENGE : FraudAdvice.REJECT
        };
        if (context.fraud.advice === FraudAdvice.REJECT) {
            context.payment.status = PaymentStatus.REFUSED;
            context.payment.refusalReason = "Fraud";
        }
        this.log('Fraudscore action completed', context.fraud);
        return context;
    }
} 