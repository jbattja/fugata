# Card Validation Utilities

This module provides comprehensive card number validation utilities that can be used across all Fugata services.

## Features

- **Luhn Algorithm Check**: Validates card numbers using the industry-standard Luhn algorithm
- **Card Network Detection**: Automatically detects Visa, Mastercard, American Express, Discover, JCB, Diners Club, and China UnionPay
- **Length Validation**: Ensures card numbers are between 13-19 digits with network-specific validation
- **Formatting**: Provides utilities for formatting and masking card numbers
- **Flexible Input**: Handles card numbers with spaces, dashes, and other separators

## Usage

### Basic Validation

```typescript
import { validateCardNumber } from '@fugata/shared';

// Validate a card number
const result = validateCardNumber('4111111111111111');

if (result.isValid) {
  console.log('Valid card:', result.normalizedNumber);
  console.log('Network:', result.cardNetwork);
  console.log('Length:', result.length);
} else {
  console.log('Invalid card:', result.error);
}
```

### Validation with Options

```typescript
// Allow only specific separators
const result = validateCardNumber('4111-1111-1111-1111', {
  allowSpaces: false,
  allowDashes: true,
  allowUnderscores: false,
  strictMode: true // Only allow known card networks
});
```

### Formatting Utilities

```typescript
import { normalizeCardNumber, formatCardNumber, maskCardNumber } from '@fugata/shared';

// Normalize card number (remove separators)
const normalized = normalizeCardNumber('4111 1111-1111_1111');
// Result: '4111111111111111'

// Format for display
const formatted = formatCardNumber('4111111111111111');
// Result: '4111 1111 1111 1111'

// Mask for security
const masked = maskCardNumber('4111111111111111');
// Result: '**** **** **** 1111'
```

## Supported Card Networks

| Network | Prefixes | Lengths |
|---------|----------|---------|
| Visa | 4 | 13, 16, 19 |
| Mastercard | 51-55, 2221-2720 | 16 |
| American Express | 34, 37 | 15 |
| Discover | 6011, 622126-622925, 644-649, 65 | 16 |
| JCB | 2131, 1800, 35 | 16 |
| Diners Club | 300-305, 36, 38-39 | 14, 16 |
| China UnionPay | 62 | 16-19 |

## Validation Steps

1. **Normalization**: Removes allowed separators (spaces, dashes, underscores)
2. **Digit Check**: Ensures only digits remain
3. **Length Check**: Validates 13-19 digit range
4. **Network Detection**: Identifies card network based on prefixes
5. **Strict Mode**: Optionally rejects unknown networks
6. **Luhn Check**: Validates using Luhn algorithm
7. **Network-Specific Length**: Validates length for detected network

## Error Messages

- `"Card number must contain only digits"`
- `"Card number must be between 13 and 19 digits (got X)"`
- `"Card number does not match any known card network"`
- `"Card number failed Luhn check"`
- `"Invalid length for [NETWORK] card (expected X, got Y)"`

## Integration Examples

### Token Vault Service

```typescript
// In token-vault.service.ts
const validationResult = validateCardNumber(createTokenDto.cardNumber);
if (!validationResult.isValid) {
  throw new BadRequestException(`Invalid card number: ${validationResult.error}`);
}
```

### Checkout Service

```typescript
// In checkout form validation
const result = validateCardNumber(cardNumber, { strictMode: true });
if (!result.isValid) {
  setCardError(result.error);
  return;
}
```

### Payment Processor

```typescript
// In payment processing
const validation = validateCardNumber(payment.cardNumber);
if (!validation.isValid) {
  throw new PaymentValidationError(validation.error);
}
```

## Testing

The module includes comprehensive tests covering:
- Valid card numbers for all networks
- Invalid card numbers (failed Luhn check)
- Edge cases (wrong lengths, unknown networks)
- Formatting and masking utilities
- Various input formats (with separators)

Run tests with:
```bash
npm test -- card-validation.test.ts
```
