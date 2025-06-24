import { PaymentStatus } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { v4 as uuidv4 } from 'uuid';

export class RefundAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.refundAttempts++;
        this.log(`Executing Refund action attempt number ${context.refundAttempts}`);
        // TODO: Call capture service

        Math.random() > 0.1 ? this.mockRefundSuccess(context) : this.mockRefundFailed(context);

        this.log('Refund action completed', context.refund);
        return context;
    }

    private mockRefundSuccess(context: PaymentContext) { 
        context.payment.status = PaymentStatus.REFUNDED;
        context.refund = {
            refundId: uuidv4(),
            amount: context.payment.amount,
            status: "CAPTURE_SUCCESSFUL",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private mockRefundFailed(context: PaymentContext) { 
        context.refund = {
            refundId: uuidv4(),
            amount: context.payment.amount,
            status: "REFUND_FAILED",
            refusalReason: "Insufficient balance",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
} 