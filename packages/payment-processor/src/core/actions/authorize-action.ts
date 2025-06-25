import { AuthorizationData, PaymentStatus } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";

export class AuthorizeAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        context.authorizeAttempts++;
        this.log(`Executing Authorize action attempt number ${context.authorizeAttempts}`);
        // TODO: Call authorization service
        let authorizationData = context.payment.authorizationData;
        if (!authorizationData) {
            authorizationData = new AuthorizationData();
        }
        context.payment.authorizationData = authorizationData;

        Math.random() > 0.1 ? this.mockAuthorizationSuccess(context) : this.mockAuthorizationFailed(context);

        this.log('Authorize action completed', context.payment.authorizationData);
        return context;
    }

    private mockAuthorizationSuccess(context: PaymentContext) { 
        context.payment.status = PaymentStatus.AUTHORIZED;
        context.payment.authorizationData.responseMessage = "Approved";
        context.payment.authorizationData.networkResponseCode = "00";
        context.payment.authorizationData.acquirerReference = "1234567890";
        context.payment.authorizationData.avsResult = "D";
        context.payment.authorizationData.authCode = "1234567890";
    }

    private mockAuthorizationFailed(context: PaymentContext) { 
        context.payment.status = PaymentStatus.REFUSED;
        context.payment.refusalReason = "Refused";
        context.payment.authorizationData.responseMessage = "Do Not Honor";
        context.payment.authorizationData.networkResponseCode = "05";
        context.payment.authorizationData.acquirerReference = "1234567890";
        context.payment.authorizationData.avsResult = "S";
        context.payment.authorizationData.authCode = "1234567890";
        }
} 