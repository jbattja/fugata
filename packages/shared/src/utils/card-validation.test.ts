import { validateCardNumber, normalizeCardNumber, formatCardNumber, maskCardNumber } from './card-validation';

describe('Card Validation', () => {
  describe('validateCardNumber', () => {
    it('should validate a valid Visa card number', () => {
      const result = validateCardNumber('4111111111111111');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('4111111111111111');
      expect(result.cardNetwork).toBe('VISA');
      expect(result.length).toBe(16);
    });

    it('should validate a valid Mastercard number', () => {
      const result = validateCardNumber('5555555555554444');
      expect(result.isValid).toBe(true);
      expect(result.cardNetwork).toBe('MASTERCARD');
    });

    it('should validate a valid American Express number', () => {
      const result = validateCardNumber('378282246310005');
      expect(result.isValid).toBe(true);
      expect(result.cardNetwork).toBe('AMEX');
      expect(result.length).toBe(15);
    });

    it('should handle card numbers with spaces', () => {
      const result = validateCardNumber('4111 1111 1111 1111');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('4111111111111111');
    });

    it('should handle card numbers with dashes', () => {
      const result = validateCardNumber('4111-1111-1111-1111');
      expect(result.isValid).toBe(true);
      expect(result.normalizedNumber).toBe('4111111111111111');
    });

    it('should reject invalid card numbers', () => {
      const result = validateCardNumber('4111111111111112');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number failed Luhn check');
    });

    it('should reject card numbers that are too short', () => {
      const result = validateCardNumber('411111111111');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number must be between 13 and 19 digits (got 12)');
    });

    it('should reject card numbers that are too long', () => {
      const result = validateCardNumber('41111111111111111111');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number must be between 13 and 19 digits (got 20)');
    });

    it('should reject card numbers with non-digits', () => {
      const result = validateCardNumber('4111-1111-1111-111a');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number must contain only digits');
    });

    it('should validate in strict mode', () => {
      const result = validateCardNumber('9999999999999999', { strictMode: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Card number does not match any known card network');
    });
  });

  describe('normalizeCardNumber', () => {
    it('should remove spaces, dashes, and underscores', () => {
      expect(normalizeCardNumber('4111 1111-1111_1111')).toBe('4111111111111111');
    });
  });

  describe('formatCardNumber', () => {
    it('should format Visa/Mastercard numbers correctly', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    });

    it('should format American Express numbers correctly', () => {
      expect(formatCardNumber('378282246310005', 'AMEX')).toBe('3782 822463 10005');
    });
  });

  describe('maskCardNumber', () => {
    it('should mask Visa/Mastercard numbers correctly', () => {
      expect(maskCardNumber('4111111111111111')).toBe('**** **** **** 1111');
    });

    it('should mask American Express numbers correctly', () => {
      expect(maskCardNumber('378282246310005', 'AMEX')).toBe('**** ****** 0005');
    });
  });
});
