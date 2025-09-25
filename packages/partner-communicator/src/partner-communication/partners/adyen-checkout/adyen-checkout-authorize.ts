import { Payment, PaymentStatus, Amount, PaymentMethod, ActionType, RedirectMethod, Action, PaymentInstrument, CardDetails, AuthenticationData, ThreeDSecureMode } from "@fugata/shared";
import { AuthorizePaymentRequestDto } from "../../dto/authorize-payment-request.dto";
import { ConfirmPaymentRequestDto } from "../../dto/confirm-payment-request.dto";
import { AdyenConnector } from "./adyen-connector";
import { AdyenPaymentRequest, AdyenPaymentResponse, AdyenAmount, AdyenPaymentMethod, AdyenPaymentResultCode, AdyenShopper, AdyenActionMethod, AdyenActionType, AdyenAction, AdyenPaymentRequestBuilder, AdyenAuthenticationData, AdyenAttemptAuthentication } from "./types/adyen-payment";
import { getAdyenPaymentMethod } from "./types/adyen-payment-method";
import { SharedLogger } from "@fugata/shared";

export class AdyenCheckoutAuthorize {

    static async authorize(request: AuthorizePaymentRequestDto, authenticationRequest: boolean): Promise<Payment> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const apiKey = partnerConfig.apiKey;
            const merchantAccount = partnerConfig.merchantAccount;

            if (!apiKey || !merchantAccount) {
                throw new Error('Adyen configuration missing: apiKey and merchantAccount are required');
            }

            // Transform payment to Adyen request
            const adyenRequest = this.transformPaymentToAdyenRequest(request.payment, merchantAccount, authenticationRequest);
            SharedLogger.log('Adyen request: ' + JSON.stringify(adyenRequest), undefined, AdyenCheckoutAuthorize.name);

            // Call Adyen API
            const adyenResponse = await AdyenConnector.createPayment(adyenRequest, apiKey);
            SharedLogger.log('Adyen response: ' + JSON.stringify(adyenResponse), undefined, AdyenCheckoutAuthorize.name);

            // Transform Adyen response back to payment
            return this.transformAdyenResponseToPayment(request.payment, adyenResponse);

        } catch (error) {
            SharedLogger.error(`Adyen authorization failed: ${error.message}`, AdyenCheckoutAuthorize.name);
            throw error;
        }
    }

    private static transformPaymentToAdyenRequest(payment: Payment, merchantAccount: string, authenticationRequest: boolean): AdyenPaymentRequest {
        const adyenRequest = new AdyenPaymentRequestBuilder()
            .withAmount(this.mapAmountToAdyenAmount(payment.amount))
            .withMerchantAccount(merchantAccount)
            .withReference(payment.reference || `payment_${Date.now()}`)
            .withReturnUrl(payment.returnUrl)
            .withPaymentMethod(this.mapPaymentMethodToAdyenMethod(payment.paymentInstrument))
            .withMetadata(payment.metadata)
            .build();

        // Add customer information if available
        if (payment.customer) {
            adyenRequest.shopperReference = payment.customer.id;
            adyenRequest.shopperEmail = payment.customer.customerEmail;
            adyenRequest.shopperLocale = payment.customer.customerLocale;

            if (payment.customer.customerName) {
                const shopperName = payment.customer.customerName.split(' ');
                if (shopperName.length === 2) {
                    adyenRequest.shopperName = new AdyenShopper(shopperName[0], shopperName[1]);
                }
            }
        }

        // Add authentication data if available
        if (payment.authenticationData) {
            adyenRequest.authenticationData = this.mapAuthenticationDataToAdyen(payment.authenticationData, authenticationRequest);
        }

        return adyenRequest;
    }

    private static transformAdyenResponseToPayment(originalPayment: Payment, adyenResponse: AdyenPaymentResponse): Payment {
        const payment = new Payment({
            ...originalPayment,
            authorizationData: {
                acquirerReference: adyenResponse.pspReference,
            },
            partnerReference: adyenResponse.pspReference,
            status: this.mapAdyenResultCodeToPaymentStatus(adyenResponse.resultCode),
        });
        if (payment.status == PaymentStatus.REFUSED) {
            payment.refusalReason = adyenResponse.refusalReason;
        }
        if (adyenResponse.action && adyenResponse.action.type === AdyenActionType.REDIRECT) {
            payment.actions = [
                this.createRedirectAction(adyenResponse.action)
            ];
        }
        return payment;
    }

    private static createRedirectAction(adyenAction: AdyenAction): Action {
        // TODO: Implement redirect action creation using our own URL and not the Adyen one
        return {
            actionType: ActionType.REDIRECT,
            redirectUrl: adyenAction.url,
            redirectMethod: adyenAction.method === AdyenActionMethod.POST ? RedirectMethod.POST : RedirectMethod.GET,
            data: adyenAction.data
        };
    }

    private static mapAmountToAdyenAmount(amount: Amount): AdyenAmount {
        return new AdyenAmount(amount.value, amount.currency);
    }

    private static mapPaymentMethodToAdyenMethod(paymentInstrument: PaymentInstrument, testMode: boolean = true): AdyenPaymentMethod {
        if (!paymentInstrument) {
            return null;
        }
        if (!paymentInstrument.paymentMethod) {
            return null;
        }
        const adyenMethod = new AdyenPaymentMethod();
        adyenMethod.type = getAdyenPaymentMethod(paymentInstrument.paymentMethod);
        if (paymentInstrument.paymentMethod === PaymentMethod.CARD) {
            const cardDetails = paymentInstrument.instrumentDetails as CardDetails;
            if (!cardDetails) {
                return adyenMethod;
            }
            if (testMode) {
                adyenMethod.encryptedCardNumber = cardDetails.number ? 'test_' + cardDetails.number : null;
                adyenMethod.encryptedExpiryMonth = cardDetails.expiryMonth ? 'test_' + cardDetails.expiryMonth.toString() : null;
                adyenMethod.encryptedExpiryYear = cardDetails.expiryYear ? 'test_' + cardDetails.expiryYear.toString() : null;
                adyenMethod.encryptedSecurityCode = cardDetails.cvc ? 'test_' + cardDetails.cvc : null;
            } else {
                adyenMethod.number = cardDetails.number;
                adyenMethod.expiryMonth = cardDetails.expiryMonth.toString();
                adyenMethod.expiryYear = cardDetails.expiryYear.toString();
                adyenMethod.cvc = cardDetails.cvc;
            }
        }
        return adyenMethod;
    }

    private static mapAdyenResultCodeToPaymentStatus(resultCode: AdyenPaymentResultCode): PaymentStatus {
        switch (resultCode) {
            case AdyenPaymentResultCode.AUTHENTICATION_FINISHED:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.AUTHENTICATION_NOT_REQUIRED:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.AUTHORISED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.CANCELLED:
                return PaymentStatus.REFUSED;
            case AdyenPaymentResultCode.CHALLENGE_SHOPPER:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.ERROR:
                return PaymentStatus.REFUSED;
            case AdyenPaymentResultCode.IDENTIFY_SHOPPER:
                return PaymentStatus.INITIATED;
            // TODO: Implement partial authorizations or have an error state? 
            case AdyenPaymentResultCode.PARTIALLY_AUTHORISED:
                return PaymentStatus.AUTHORIZED;
            case AdyenPaymentResultCode.PENDING:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.PRESENT_TO_SHOPPER:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.RECEIVED:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.REDIRECT_SHOPPER:
                return PaymentStatus.INITIATED;
            case AdyenPaymentResultCode.REFUSED:
                return PaymentStatus.REFUSED;

            default:
                return PaymentStatus.REFUSED;
        }
    }

    private static mapAuthenticationDataToAdyen(authenticationData: AuthenticationData, authenticationRequest: boolean): AdyenAuthenticationData {
        const adyenAuthData: AdyenAuthenticationData = new AdyenAuthenticationData();

        if (authenticationRequest) {
            adyenAuthData.attemptAuthentication = AdyenAttemptAuthentication.ALWAYS;
        } else if (authenticationData.threeDSecureMode) {
            switch (authenticationData.threeDSecureMode) {
                case ThreeDSecureMode.THREE_DS_SKIP:
                    adyenAuthData.attemptAuthentication = AdyenAttemptAuthentication.NEVER;
                    break;
                case ThreeDSecureMode.THREE_DS_REQUIRE:
                    adyenAuthData.attemptAuthentication = AdyenAttemptAuthentication.ALWAYS;
                    break;
            }
        }
        return adyenAuthData;
    }

    /**
     * Confirm payment after redirect from partner
     */
    static async confirm(request: ConfirmPaymentRequestDto): Promise<Payment> {
        try {
            // Get partner configuration
            const partnerConfig = request.partnerConfig || {};
            const apiKey = partnerConfig.apiKey;

            if (!apiKey) {
                throw new Error('Adyen configuration missing: apiKey is required');
            }

            // For Adyen, we need to call the payments/details endpoint with the redirect parameters
            const detailsRequest = {
                details: request.urlParams || {}
            };

            // Call Adyen payments/details endpoint
            const adyenResponse = await AdyenConnector.getPaymentDetails(detailsRequest, apiKey);
                        
            // Transform the response back to our Payment object
            return this.transformAdyenResponseToPayment(request.payment, adyenResponse);
            
        } catch (error) {
            SharedLogger.error(`Adyen confirmation failed: ${error.message}`, error, AdyenCheckoutAuthorize.name);
            throw error;
        }
    }

} 