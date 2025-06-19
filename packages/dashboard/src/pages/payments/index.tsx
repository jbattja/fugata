import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { PaymentRequest, PaymentStatus } from '@fugata/shared';
import { formatAmount } from '@/lib/utils/currency';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';

export const dynamic = 'force-dynamic';

const statusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.REQUIRES_ACTION]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_PAYMENT_METHOD]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_CAPTURE]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.AWAITING_CONFIRMATION]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.CANCELED]: 'bg-red-100 text-red-800',
  [PaymentStatus.SUCCEEDED]: 'bg-green-100 text-green-800',
  [PaymentStatus.FAILED]: 'bg-red-100 text-red-800',
};

export default function PaymentsPage() {
  const { data: session } = useSession();

  const { data: payments, isLoading, error } = useQuery<PaymentRequest[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    },
  });

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500">Error loading payments: {(error as Error).message}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Payments"
        description="A list of all payments including their status, amount, and customer details."
        data={payments || []}
        columns={[
          {
            header: 'Amount',
            accessor: (payment) => payment.amount ? formatAmount(payment.amount.value, payment.amount.currency) : '-',
          },
          {
            header: 'Status',
            accessor: (payment) => (
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[payment.status || PaymentStatus.PENDING]}`}>
                {payment.status}
              </span>
            ),
          },
          { header: 'Payment Method', accessor: 'paymentMethod' },
          { header: 'Reference', accessor: 'reference' },
          { header: 'Merchant', accessor: 'merchantCode' },
          { header: 'Provider', accessor: 'providerCode' },
          {
            header: 'Customer',
            accessor: (payment) => (
              <div>
                <div className="font-medium text-gray-900">{payment.customer?.customerName}</div>
                <div className="text-gray-500">{payment.customer?.customerEmail}</div>
              </div>
            ),
          },
          {
            header: 'Created',
            accessor: (payment) => payment.created ? new Date(payment.created).toLocaleString() : '-',
          },
        ]}
        searchKeys={['customer.customerName', 'customer.customerEmail', 'reference']}
      />
    </DashboardLayout>
  );
}