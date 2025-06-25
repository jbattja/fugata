import { PaymentStatus } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";

export class VoidAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.voidAttempts++;
        this.log(`Executing Void action attempt number ${context.voidAttempts}`);
        // TODO: Call capture service

        Math.random() > 0.1 ? this.mockVoidSuccess(context) : this.mockVoidFailed();
        this.log('Void action completed');
        return context;
    }

    private mockVoidSuccess(context: PaymentContext) { 
        context.payment.status = PaymentStatus.VOIDED;
    }

    private mockVoidFailed() { 
    }
} 