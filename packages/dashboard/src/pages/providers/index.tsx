import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { Provider } from '@fugata/shared';
import { useRouter } from 'next/router';
import { DataTable } from '@/components/ui/DataTable';

export default function Providers() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: providers, isLoading, error } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await fetch('/api/providers');
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
          { header: 'Name', accessor: 'name' },
          { header: 'Provider Code', accessor: 'providerCode' },
          {
            header: 'Created At',
            accessor: (provider) => new Date(provider.createdAt).toLocaleDateString(),
          },
        ]}
        searchKeys={['name', 'providerCode']}
        onAdd={() => router.push('/providers/new')}
        addButtonText="Add Provider"
        actionButtons={[
          {
            name: 'Edit',
            action: (provider) => router.push(`/providers/${provider.id}`),
          },
          {
            name: 'Credentials',
            action: (provider) => router.push(`/provider-credentials?providerCode=${provider.providerCode}`),
          },
        ]}
      />
    </DashboardLayout>
  );
} 