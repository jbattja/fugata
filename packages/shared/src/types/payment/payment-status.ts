// TODO: Add more statuses and mapping to payment processor statuses
export enum PaymentRequestStatus {
    REQUIRES_ACTION = 'REQUIRES_ACTION',
    PENDING = 'PROCESSING',
    AWAITING_PAYMENT_METHOD = 'AWAITING_PAYMENT_METHOD',
    AWAITING_CAPTURE = 'REQUIRES_CAPTURE',
    AWAITING_CONFIRMATION = 'REQUIRES_CONFIRMATION',
    CANCELED = 'CANCELED',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED'
  }
  