import { PaymentStatus } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { v4 as uuidv4 } from 'uuid';

export class CaptureAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.captureAttempts++;

        this.log(`Executing Capture action attempt number ${context.captureAttempts}`);
        // TODO: Call capture service

        Math.random() > 0.1 ? this.mockCaptureSuccess(context) : this.mockCaptureFailed(context);

        this.log('Capture action completed', context.capture);
        return context;
    }

    private mockCaptureSuccess(context: PaymentContext) { 
        context.payment.status = PaymentStatus.CAPTURED;
        context.capture = {
            captureId: uuidv4(),
            amount: context.payment.amount,
            status: "CAPTURE_SUCCESSFUL",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private mockCaptureFailed(context: PaymentContext) { 
        context.capture = {
            captureId: uuidv4(),
            amount: context.payment.amount,
            status: "CAPTURE_FAILED",
            refusalReason: "Network Error",
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
} 