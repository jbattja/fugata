import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { Payment, PaymentStatus } from '@fugata/shared';
import { formatAmount } from '@/lib/utils/currency';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { callApi } from '@/lib/api/api-caller';
import { useMerchantContext } from '@/contexts/MerchantContext';

export const dynamic = 'force-dynamic';

export default function PaymentsPage() {
  const { data: session } = useSession();
  const { activeMerchant } = useMerchantContext();
  const { data: payments, isLoading, error } = useQuery<{ data: Payment[] }>({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await callApi('/api/payments', {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      return data;
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
        data={payments?.data || []}
        columns={[
          {
            header: 'Payment ID',
            accessor: 'paymentId',
          },
          {
            header: 'Amount',
            accessor: (payment) => payment.amount ? formatAmount(payment.amount.value, payment.amount.currency) : '-',
          },
          {
            header: 'Status',
            accessor: (payment) => (
              <StatusBadge status={payment.status || PaymentStatus.INITIATED} type="payment" />
            ),
          },
          {
            header: 'Reason',
            accessor: (payment) => payment.refusalReason || '-',
          },
          {
            header: 'Payment Method',
            accessor: (payment) => payment.paymentInstrument?.paymentMethod || '-',
          },
          { header: 'Reference', accessor: 'reference' },
          {
            header: 'Merchant',
            accessor: (payment) => payment.merchant?.accountCode || '-',
          },
          {
            header: 'Provider',
            accessor: (payment) => payment.providerCredential?.provider?.accountCode || '-',
          },
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
            accessor: (payment) => payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-',
          },
          {
            header: 'Updated',
            accessor: (payment) => payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : '-',
          },
        ]}
        searchKeys={['customer.customerName', 'customer.customerEmail', 'reference', 'paymentId']}
      />
    </DashboardLayout>
  );
}