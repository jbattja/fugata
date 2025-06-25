import { PaymentStatus, AccountStatus, PaymentRequestStatus } from "@fugata/shared";

const paymentRequestStatusColors: Record<PaymentRequestStatus, string> = {
  [PaymentRequestStatus.REQUIRES_ACTION]: 'bg-yellow-100 text-yellow-800',
  [PaymentRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentRequestStatus.AWAITING_PAYMENT_METHOD]: 'bg-yellow-100 text-yellow-800',
  [PaymentRequestStatus.AWAITING_CAPTURE]: 'bg-yellow-100 text-yellow-800',
  [PaymentRequestStatus.AWAITING_CONFIRMATION]: 'bg-yellow-100 text-yellow-800',
  [PaymentRequestStatus.CANCELED]: 'bg-red-100 text-red-800',
  [PaymentRequestStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
  [PaymentRequestStatus.FAILED]: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.INITIATED]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AUTHORIZATION_PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AUTHORIZED]: 'bg-green-100 text-green-800',
  [PaymentStatus.REFUSED]: 'bg-red-100 text-red-800',
  [PaymentStatus.PARTIALLY_CAPTURED]: 'bg-green-100 text-green-800',
  [PaymentStatus.CAPTURED]: 'bg-green-100 text-green-800',
  [PaymentStatus.VOIDED]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.REVERSED]: 'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-red-100 text-red-800',
};


const accountStatusColors: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [AccountStatus.INACTIVE]: 'bg-red-100 text-red-800',
  [AccountStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
};

interface StatusBadgeProps {
  status: PaymentStatus | AccountStatus | PaymentRequestStatus;
  type: 'payment' | 'account' | 'payment-request';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${type === 'payment' ? paymentStatusColors[status as PaymentStatus] : type === 'payment-request' ? paymentRequestStatusColors[status as PaymentRequestStatus] : accountStatusColors[status as AccountStatus]}`}>
    {status}
  </span>
);
}
