import { TokenVaultClient, SharedLogger } from '@fugata/shared';
import { PaymentInstrument, CardDetails, PaymentMethod } from '@fugata/shared';
import { CreateCardTokenRequest, DecryptedCardData } from '@fugata/shared';
import { validateCardNumber } from '@fugata/shared';
import { TokenResponse } from '@fugata/shared/src/clients/token-vault.client';
import { ValidationException } from 'src/exceptions/validation.exception';

export class TokenizationUtils {

  /**
   * Process payment instrument data: create token and enrich with all necessary data
   * @param paymentInstrument - The payment instrument containing details
   * @param merchantId - The merchant ID
   * @param tokenVaultClient - The token vault client for API calls
   * @returns Updated payment instrument with token and enriched data
   */
  static async processPaymentInstrumentData(
    paymentInstrument: PaymentInstrument,
    merchantId: string,
    tokenVaultClient: TokenVaultClient
  ): Promise<PaymentInstrument> {
    if (paymentInstrument.paymentInstrumentId) {
      SharedLogger.log(`Getting token ${paymentInstrument.paymentInstrumentId} for merchant ${merchantId}`, undefined, TokenizationUtils.name);
      const decryptedCardData = await TokenizationUtils.getDecryptedCardData(paymentInstrument.paymentInstrumentId, merchantId, tokenVaultClient);
      paymentInstrument = TokenizationUtils.updatePaymentInstrumentWithDecryptedCardData(paymentInstrument, decryptedCardData);
      return paymentInstrument;
    }
    // For now, only process if it's a card payment (expandable for other payment methods)
    if (paymentInstrument.paymentMethod !== PaymentMethod.CARD) {
      return paymentInstrument;
    }

    const cardDetails = paymentInstrument.instrumentDetails as CardDetails;
    if (!cardDetails) {
      throw new ValidationException('Card payment requires card details');
    }

    if (!cardDetails.number) {
      throw new ValidationException('Card number is required for card payments');
    }

    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      throw new ValidationException('Card expiry date (month and year) is required for card payments');
    }

    const validationResult = validateCardNumber(cardDetails.number.toString());
    if (!validationResult.isValid) {
      throw new ValidationException(`Invalid card number: ${validationResult.error || 'Card number validation failed'}`);
    }

    try {
      // Create a new token
      const createTokenRequest: CreateCardTokenRequest = {
        cardNumber: validationResult.normalizedNumber,
        cardHolderName: cardDetails.cardHolderName,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
        merchantId,
        customerId: paymentInstrument.customerId,
        paymentMethod: PaymentMethod.CARD,
        cardNetwork: validationResult.cardNetwork,
      };

      const tokenResponse = await tokenVaultClient.createToken(createTokenRequest);
      paymentInstrument = TokenizationUtils.updatePaymentInstrumentWithToken(paymentInstrument, tokenResponse);
      SharedLogger.log(`Created token ${tokenResponse.token} for card ${tokenResponse.maskedNumber}`, undefined, TokenizationUtils.name);
      return paymentInstrument;

    } catch (error) {
      SharedLogger.error('Failed to create card token:', error, TokenizationUtils.name);
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new Error(`Failed to process payment instrument data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static updatePaymentInstrumentWithToken(paymentInstrument: PaymentInstrument, tokenResponse: TokenResponse): PaymentInstrument {
    paymentInstrument.paymentInstrumentId = tokenResponse.token;
    const cardDetails = paymentInstrument.instrumentDetails as CardDetails;
    if (cardDetails) {
      cardDetails.maskedNumber = tokenResponse.maskedNumber;
      cardDetails.bin = tokenResponse.bin;
      cardDetails.last4 = tokenResponse.last4;
      cardDetails.issuerName = tokenResponse.issuerName;
      cardDetails.country = tokenResponse.country;
    }
    return paymentInstrument;
  }

  static updatePaymentInstrumentWithDecryptedCardData(paymentInstrument: PaymentInstrument, decryptedCardData: DecryptedCardData): PaymentInstrument {
    const cardDetails = new CardDetails();
    cardDetails.number = decryptedCardData.cardNumber;
    cardDetails.cvc = decryptedCardData.cvc;
    cardDetails.cardHolderName = decryptedCardData.cardHolderName;
    cardDetails.expiryMonth = decryptedCardData.expiryMonth;
    cardDetails.expiryYear = decryptedCardData.expiryYear;
    paymentInstrument.instrumentDetails = cardDetails;
    return paymentInstrument;
  }

  /**
   * Clean up sensitive data from payment instrument
   * @param paymentInstrument - The payment instrument with potentially sensitive data
   * @returns Payment instrument with sensitive data removed
   */
  static cleanUpSensitiveData(paymentInstrument: PaymentInstrument): PaymentInstrument {
    if (paymentInstrument.paymentMethod !== PaymentMethod.CARD) {
      return paymentInstrument;
    }

    const cardDetails = paymentInstrument.instrumentDetails as CardDetails;
    if (!cardDetails) {
      return paymentInstrument;
    }

    // Remove sensitive card data
    delete cardDetails.number;
    delete cardDetails.cvc;

    // Ensure we have masked information
    if (!cardDetails.maskedNumber && cardDetails.last4) {
      cardDetails.maskedNumber = `****-****-****-${cardDetails.last4}`;
    }
    return paymentInstrument;
  }

  /**
   * Get decrypted card data for partner communication (if needed)
   * @param token - The Fugata token
   * @param merchantId - The merchant ID
   * @param tokenVaultClient - The token vault client for API calls
   * @returns Decrypted card data
   */
  static async getDecryptedCardData(
    token: string,
    merchantId: string,
    tokenVaultClient: TokenVaultClient
  ): Promise<DecryptedCardData> {
    try {
      const decryptedData = await tokenVaultClient.decryptToken({
        token,
        merchantId
      });

      return decryptedData;

    } catch (error) {
      SharedLogger.error('Failed to decrypt card data:', error, TokenizationUtils.name);
      throw new Error(`Failed to retrieve card data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
