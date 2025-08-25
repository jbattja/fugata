import { CardNetwork } from "../types/payment/payment-method";

export interface CardValidationResult {
  isValid: boolean;
  normalizedNumber?: string;
  error?: string;
  cardNetwork?: CardNetwork;
  length?: number;
}

export interface CardValidationOptions {
  allowSpaces?: boolean;
  allowDashes?: boolean;
  allowUnderscores?: boolean;
  strictMode?: boolean; // If true, only allows valid card networks
}

/**
 * Validates a card number using Luhn algorithm and other checks
 * @param cardNumber - The card number to validate
 * @param options - Validation options
 * @returns CardValidationResult with validation status and normalized number
 */
export function validateCardNumber(
  cardNumber: string, 
  options: CardValidationOptions = {}
): CardValidationResult {
  const {
    allowSpaces = true,
    allowDashes = true,
    allowUnderscores = false,
    strictMode = false
  } = options;

  try {
    // Step 1: Normalize the card number (remove allowed separators)
    let normalizedNumber = cardNumber;
    
    if (allowSpaces) {
      normalizedNumber = normalizedNumber.replace(/\s/g, '');
    }
    if (allowDashes) {
      normalizedNumber = normalizedNumber.replace(/-/g, '');
    }
    if (allowUnderscores) {
      normalizedNumber = normalizedNumber.replace(/_/g, '');
    }

    // Step 2: Check if it contains only digits
    if (!/^\d+$/.test(normalizedNumber)) {
      return {
        isValid: false,
        error: 'Card number must contain only digits'
      };
    }

    // Step 3: Check length (13-19 digits)
    const length = normalizedNumber.length;
    if (length < 13 || length > 19) {
      return {
        isValid: false,
        error: `Card number must be between 13 and 19 digits (got ${length})`
      };
    }

    // Step 4: Detect card network
    const cardNetwork = detectCardNetwork(normalizedNumber);
    
    // Step 5: Strict mode validation (if enabled)
    if (strictMode && !cardNetwork) {
      return {
        isValid: false,
        error: 'Card number does not match any known card network'
      };
    }

    // Step 6: Luhn check
    if (!luhnCheck(normalizedNumber)) {
      return {
        isValid: false,
        error: 'Card number failed Luhn check'
      };
    }

    // Step 7: Network-specific length validation
    if (cardNetwork && !isValidLengthForNetwork(normalizedNumber, cardNetwork)) {
      return {
        isValid: false,
        error: `Invalid length for ${cardNetwork} card (expected ${getExpectedLengthForNetwork(cardNetwork)}, got ${length})`
      };
    }

    return {
      isValid: true,
      normalizedNumber,
      cardNetwork: cardNetwork || undefined,
      length
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Performs Luhn algorithm check on a card number
 * @param cardNumber - Normalized card number (digits only)
 * @returns true if the card number passes Luhn check
 */
function luhnCheck(cardNumber: string): boolean {
  if (!/^\d+$/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  // Process from right to left
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Detects the card network based on the card number
 * @param cardNumber - Normalized card number (digits only)
 * @returns Card network name or null if unknown
 */
function detectCardNetwork(cardNumber: string): CardNetwork | null {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleanNumber)) {
    return CardNetwork.VISA;
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7][2-9][0-9]/.test(cleanNumber)) {
    return CardNetwork.MASTERCARD;
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleanNumber)) {
    return CardNetwork.AMEX;
  }
  
  // Discover: starts with 6011, 622126-622925, 644-649, 65
  if (/^6(?:011|5|4[4-9]|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d\d|9(?:[01]\d|2[0-5])))/.test(cleanNumber)) {
    return CardNetwork.DISCOVER;
  }
  
  // JCB: starts with 2131, 1800, or 35
  if (/^(?:2131|1800|35)/.test(cleanNumber)) {
    return CardNetwork.JCB;
  }
  
  // Diners Club: starts with 300-305, 36, or 38-39
  if (/^3(?:0[0-5]|[68]|9)/.test(cleanNumber)) {
    return CardNetwork.DINERS;
  }
  
  // China UnionPay: starts with 62
  if (/^62/.test(cleanNumber)) {
    return CardNetwork.CUP;
  }
  
  return null;
}

/**
 * Checks if the card number length is valid for the detected network
 * @param cardNumber - Normalized card number
 * @param network - Card network
 * @returns true if length is valid for the network
 */
function isValidLengthForNetwork(cardNumber: string, network: CardNetwork): boolean {
  const length = cardNumber.length;
  
  switch (network) {
    case CardNetwork.VISA:
      return length === 13 || length === 16 || length === 19;
    case CardNetwork.MASTERCARD:
      return length === 16;
    case CardNetwork.AMEX:
      return length === 15;
    case CardNetwork.DISCOVER:
      return length === 16;
    case CardNetwork.JCB:
      return length === 16;
    case CardNetwork.DINERS:
      return length === 14 || length === 16;
    case CardNetwork.CUP:
      return length >= 16 && length <= 19;
    default:
      return length >= 13 && length <= 19;
  }
}

/**
 * Gets the expected length(s) for a card network
 * @param network - Card network
 * @returns Expected length(s) as string
 */
function getExpectedLengthForNetwork(network: CardNetwork): string {
  switch (network) {
    case CardNetwork.VISA:
      return '13, 16, or 19';
    case CardNetwork.MASTERCARD:
      return '16';
    case CardNetwork.AMEX:
      return '15';
    case CardNetwork.DISCOVER:
      return '16';
    case CardNetwork.JCB:
      return '16';
    case CardNetwork.DINERS:
      return '14 or 16';
    case CardNetwork.CUP:
      return '16-19';
    default:
      return '13-19';
  }
}

/**
 * Normalizes a card number by removing common separators
 * @param cardNumber - Raw card number
 * @returns Normalized card number (digits only)
 */
export function normalizeCardNumber(cardNumber: string): string {
  return cardNumber.replace(/[\s\-_]/g, '');
}

/**
 * Formats a card number with spaces for display
 * @param cardNumber - Normalized card number
 * @param network - Card network (optional, for optimal formatting)
 * @returns Formatted card number
 */
export function formatCardNumber(cardNumber: string, network?: CardNetwork): string {
  const normalized = normalizeCardNumber(cardNumber);
  
  // AMEX uses 4-6-5 format
  if (network === CardNetwork.AMEX || (normalized.length === 15 && /^3[47]/.test(normalized))) {
    return normalized.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  
  // Most other cards use 4-4-4-4 format
  return normalized.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

/**
 * Masks a card number for display (shows only last 4 digits)
 * @param cardNumber - Normalized card number
 * @param network - Card network (optional, for optimal formatting)
 * @returns Masked card number
 */
export function maskCardNumber(cardNumber: string, network?: CardNetwork): string {
  const normalized = normalizeCardNumber(cardNumber);
  const last4 = normalized.slice(-4);
  
  if (network === CardNetwork.AMEX || (normalized.length === 15 && /^3[47]/.test(normalized))) {
    return `**** ****** ${last4}`;
  }
  
  return `**** **** **** ${last4}`;
}
