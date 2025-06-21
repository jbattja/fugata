import { PaymentStatus, AccountStatus } from "@fugata/shared";

const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.REQUIRES_ACTION]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_PAYMENT_METHOD]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_CAPTURE]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_CONFIRMATION]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.CANCELED]: 'bg-red-100 text-red-800',
  [PaymentStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
};

const accountStatusColors: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [AccountStatus.INACTIVE]: 'bg-red-100 text-red-800',
  [AccountStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
};

interface StatusBadgeProps {
  status: PaymentStatus | AccountStatus;
  type: 'payment' | 'account';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${type === 'payment' ? paymentStatusColors[status as PaymentStatus] : accountStatusColors[status as AccountStatus]}`}>
    {status}
  </span>
);
}
