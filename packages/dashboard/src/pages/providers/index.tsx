import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { AccountStatus, Provider } from '@fugata/shared';
import { useRouter } from 'next/router';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { callApi } from '@/lib/api/api-caller';

export default function Providers() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await callApi('/api/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
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
        <div className="text-red-500">Error loading providers</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Providers"
        description="A list of all providers including their name and provider code."
        data={providers || []}
        columns={[
          { header: 'Account Code', accessor: 'accountCode' },
          { header: 'Description', accessor: 'description' },
          {
            header: 'Created At',
            accessor: (provider) => provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'N/A',
          },
          {
            header: 'Status',
            accessor: (provider) => (
              <StatusBadge status={provider.status || AccountStatus.PENDING} type="account" />
            ),
          },

        ]}
        searchKeys={['accountCode', 'description']}
        onAdd={() => router.push('/providers/new')}
        addButtonText="Add Provider"
        actionButtons={[
          {
            name: 'Edit',
            action: (provider) => router.push(`/providers/${provider.id}`),
          },
          {
            name: 'Credentials',
            action: (provider) => {
              const providerData = btoa(JSON.stringify(provider));
              router.push(`/provider-credentials?provider=${providerData}`);
              
            },
          },
        ]}
      />
    </DashboardLayout>
  );
} 