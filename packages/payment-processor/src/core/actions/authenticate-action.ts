import { Action, ActionType, AuthenticationData, AuthenticationFlow, PaymentStatus, RedirectMethod } from "@fugata/shared";
import { PaymentContext } from "../types/workflow.types";
import { BaseAction } from "./base-action";
import { v4 as uuidv4 } from 'uuid';

export class AuthenticateAction extends BaseAction {
    async execute(context: PaymentContext): Promise<PaymentContext> {
        this.log('Executing Authenticate action');
        // TODO: Call authentication service
        let authenticationData = context.payment.authenticationData;
        if (!authenticationData) {
            authenticationData = new AuthenticationData();
        }
        context.payment.authenticationData = authenticationData;

        Math.random() > 0.5 ? this.mockAuthenticationChallenge(context) : this.mockAuthenticationFrictionless(context);

        this.log('Authenticate action completed', context.payment.authenticationData);
        return context;
    }

    private mockAuthenticationChallenge(context: PaymentContext) { 
        context.payment.authenticationData.authenticationFlow = AuthenticationFlow.CHALLENGE;
        const redirectLinkUrl = process.env.PAYMENT_LINK_URL || 'http://localhost:8080';
        const action = new Action();
        action.actionType = ActionType.REDIRECT;
        action.redirectUrl = `${redirectLinkUrl}/redirect/${context.payment.paymentId}`;
        action.redirectMethod = RedirectMethod.GET;
        context.payment.addAction(action);
    }

    private mockAuthenticationFrictionless(context: PaymentContext) { 
        context.payment.authenticationData.authenticationFlow = AuthenticationFlow.FRICTIONLESS;
        context.payment.authenticationData.eci = "7";
        context.payment.authenticationData.liabilityShifted = "Y";
        context.payment.authenticationData.version = "2.1.0";
        context.payment.authenticationData.transactionId = uuidv4();
        context.payment.authenticationData.cavv = "1234567890";
        context.payment.status = PaymentStatus.AUTHORIZATION_PENDING;
        }
} 