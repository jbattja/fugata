import { Action, ActionType, RedirectMethod } from '@fugata/shared';
import { RedirectEncryptionUtil } from '@fugata/shared';
import { SharedLogger } from '@fugata/shared';

export class RedirectWrapperService {
    private static readonly CHECKOUT_BASE_URL = process.env.PAYMENT_LINK_URL || 'http://localhost:8081';

    /**
     * Wraps a redirect action by encrypting it and replacing the URL with our checkout redirect page
     */
    static wrapRedirectAction(originalAction: Action, paymentId: string): Action {
        if (originalAction.actionType !== ActionType.REDIRECT) {
            throw new Error('Action must be of type REDIRECT to be wrapped');
        }

        if (!originalAction.redirectUrl) {
            throw new Error('Redirect action must have a redirectUrl');
        }

        try {
            // Encrypt the original action using compact representation
            const encryptedBlob = RedirectEncryptionUtil.encryptRedirectAction(originalAction);
            
            // Create a new action that redirects to our checkout page using POST
            const wrappedAction: Action = {
                actionType: ActionType.REDIRECT,
                redirectUrl: `${this.CHECKOUT_BASE_URL}/redirect/${paymentId}`,
                redirectMethod: RedirectMethod.POST,
                data: {
                    encryptedAction: encryptedBlob
                }
            };
            
            return wrappedAction;
        } catch (error) {
            SharedLogger.error(`Failed to wrap redirect action: ${error.message}`, error, RedirectWrapperService.name);
            throw error;
        }
    }

    /**
     * Creates a partner-specific return URL for redirects
     */
    static createPartnerReturnUrl(paymentId: string, partnerName?: string): string {
        const baseUrl = `${this.CHECKOUT_BASE_URL}/confirm/${paymentId}`;
        if (partnerName) {
            return `${baseUrl}?from=${encodeURIComponent(partnerName)}`;
        }
        return baseUrl;
    }

    /**
     * Wraps all redirect actions in a payment's actions array
     */
    static wrapPaymentRedirects(actions: Action[], paymentId: string): Action[] {
        if (!actions || actions.length === 0) {
            return actions;
        }

        return actions.map(action => {
            if (this.canWrapAction(action)) {
                return this.wrapRedirectAction(action, paymentId);
            }
            return action;
        });
    }

    /**
     * Validates that a redirect action can be wrapped
     */
    static canWrapAction(action: Action): boolean {
        return action.actionType === ActionType.REDIRECT && 
               !!action.redirectUrl &&
               !!action.redirectMethod;
    }
}
