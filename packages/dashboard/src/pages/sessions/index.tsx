import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { PaymentSession, SessionStatus } from '@fugata/shared';
import { formatAmount } from '@/lib/utils/currency';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { callApi } from '@/lib/api/api-caller';
import { useMerchantContext } from '@/contexts/MerchantContext';

export const dynamic = 'force-dynamic';

export default function SessionsPage() {
  const { data: session } = useSession();
  const { activeMerchant } = useMerchantContext();
  const { data: sessions, isLoading, error } = useQuery<{ data: PaymentSession[] }>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await callApi('/api/sessions', {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
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
        <div className="text-red-500">Error loading sessions: {(error as Error).message}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Payment Sessions"
        description="A list of all payment sessions including their status, amount, and customer details."
        data={sessions?.data || []}
        columns={[
          {
            header: 'Session ID',
            accessor: 'sessionId',
          },
          {
            header: 'Amount',
            accessor: (session) => session.amount ? formatAmount(session.amount.value, session.amount.currency) : '-',
          },
          {
            header: 'Status',
            accessor: (session) => (
              <StatusBadge status={session.status || SessionStatus.PENDING} type="session" />
            ),
          },
          { header: 'Reference', accessor: 'reference' },
          { header: 'Mode', accessor: 'mode' },
          { header: 'Capture Method', accessor: 'captureMethod' },
          {
            header: 'Merchant',
            accessor: (session) => session.merchant?.accountCode || '-',
          },
          {
            header: 'Customer',
            accessor: (session) => (
              <div>
                <div className="font-medium text-gray-900">{session.customer?.customerName}</div>
                <div className="text-gray-500">{session.customer?.customerEmail}</div>
              </div>
            ),
          },
          {
            header: 'Created',
            accessor: (session) => session.createdAt ? new Date(session.createdAt).toLocaleString() : '-',
          },
          {
            header: 'Updated',
            accessor: (session) => session.updatedAt ? new Date(session.updatedAt).toLocaleString() : '-',
          },
          {
            header: 'Expires',
            accessor: (session) => session.expiresAt ? new Date(session.expiresAt).toLocaleString() : '-',
          },
        ]}
        searchKeys={['customer.customerName', 'customer.customerEmail', 'reference', 'sessionId']}
      />
    </DashboardLayout>
  );
}
