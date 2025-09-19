import { Payment, PaymentStatus } from "@fugata/shared";
import { AuthorizePaymentRequestDto } from "src/partner-communication/dto/authorize-payment-request.dto";
import { ConfirmPaymentRequestDto } from "src/partner-communication/dto/confirm-payment-request.dto";

export class DemoPartnerAuthorize {

    static authorize(request: AuthorizePaymentRequestDto): Payment {
        if (request.payment.customer?.customerName) {
            switch (request.payment.customer.customerName.toLowerCase()) {
                case 'refused':
                    return this.refusedPayment(request.payment);
                case 'expired card':
                    return this.expiredCardPayment(request.payment);
                case 'insufficient funds':
                    return this.insufficientFundsPayment(request.payment);
                default:
                    return this.successfulPayment(request.payment);
            }
        }
        return this.successfulPayment(request.payment);
    }
    
    static confirm(request: ConfirmPaymentRequestDto): Payment {
        if (request.payment.customer?.customerName) {
            switch (request.payment.customer.customerName.toLowerCase()) {
                case 'refused':
                    return this.refusedPayment(request.payment);
                case 'expired card':
                    return this.expiredCardPayment(request.payment);
                case 'insufficient funds':
                    return this.insufficientFundsPayment(request.payment);
                default:
                    return this.successfulPayment(request.payment);
            }
        }
        return this.successfulPayment(request.payment);
    }

    private static successfulPayment(payment: Payment): Payment {
        const transactionId = `demo_${Date.now()}`;
        payment.authorizationData = {
            responseMessage: 'Approved',
            networkResponseCode: '00',
            acquirerReference: transactionId,
            avsResult: 'D',
            authCode: '1234567890',
        };
        payment.status = PaymentStatus.AUTHORIZED;
        return payment;
    }

    private static refusedPayment(payment: Payment): Payment {
        const transactionId = `demo_${Date.now()}`;
        payment.authorizationData = {
            responseMessage: 'Do Not Honor',
            networkResponseCode: '05',
            acquirerReference: transactionId,
            avsResult: 'S',
            authCode: '1234567890',
        };
        payment.status = PaymentStatus.REFUSED;
        payment.refusalReason = 'Refused';
        return payment;
    }

    private static expiredCardPayment(payment: Payment): Payment {
        const transactionId = `demo_${Date.now()}`;
        payment.authorizationData = {
            responseMessage: 'Expired Card',
            networkResponseCode: '54',
            acquirerReference: transactionId,
            avsResult: 'N',
            authCode: '1234567890',
        };
        payment.status = PaymentStatus.REFUSED;
        payment.refusalReason = 'Expired Card';
        return payment;
    }

    private static insufficientFundsPayment(payment: Payment): Payment {
        const transactionId = `demo_${Date.now()}`;
        payment.authorizationData = {
            responseMessage: 'Insufficient Funds',
            networkResponseCode: '51',
            acquirerReference: transactionId,
            avsResult: 'D',
            authCode: '1234567890',
        };
        payment.status = PaymentStatus.REFUSED;
        payment.refusalReason = 'Insufficient Funds';
        return payment;
    }
}