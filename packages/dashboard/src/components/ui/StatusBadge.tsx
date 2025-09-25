import { PaymentStatus, AccountStatus, SessionStatus } from "@fugata/shared";

const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.INITIATED]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AUTHORIZED]: 'bg-green-100 text-green-800',
  [PaymentStatus.REFUSED]: 'bg-red-100 text-red-800',
  [PaymentStatus.PARTIALLY_CAPTURED]: 'bg-green-100 text-green-800',
  [PaymentStatus.CAPTURED]: 'bg-green-100 text-green-800',
  [PaymentStatus.VOIDED]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.REVERSED]: 'bg-red-100 text-red-800',
  [PaymentStatus.REFUNDED]: 'bg-red-100 text-red-800',
  [PaymentStatus.ERROR]: 'bg-red-100 text-red-800',
};

const sessionStatusColors: Record<SessionStatus, string> = {
  [SessionStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [SessionStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [SessionStatus.EXPIRED]: 'bg-yellow-100 text-yellow-800',
  [SessionStatus.CANCELLED]: 'bg-yellow-100 text-yellow-800',
  [SessionStatus.FAILED]: 'bg-red-100 text-red-800',
  [SessionStatus.COMPLETED]: 'bg-green-100 text-green-800',
};

const accountStatusColors: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [AccountStatus.INACTIVE]: 'bg-red-100 text-red-800',
  [AccountStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
};

interface StatusBadgeProps {
  status: PaymentStatus | AccountStatus | SessionStatus;
  type: 'payment' | 'account' | 'session';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (type) {
      case 'payment':
        return paymentStatusColors[status as PaymentStatus];
      case 'session':
        return sessionStatusColors[status as SessionStatus];
      case 'account':
        return accountStatusColors[status as AccountStatus];
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
}
