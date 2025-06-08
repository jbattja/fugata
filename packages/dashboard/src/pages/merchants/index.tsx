import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { Merchant } from '@fugata/shared';
import { useRouter } from 'next/router';
import { DataTable } from '@/components/ui/DataTable';

export default function Merchants() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: merchants, isLoading, error } = useQuery<Merchant[]>({
    queryKey: ['merchants'],
    queryFn: async () => {
      const response = await fetch('/api/merchants');
      if (!response.ok) {
        throw new Error('Failed to fetch merchants');
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
        <div className="text-red-500">Error loading merchants</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Merchants"
        description="A list of all merchants including their name and merchant code."
        data={merchants || []}
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Merchant Code', accessor: 'merchantCode' },
          {
            header: 'Created At',
            accessor: (merchant) => new Date(merchant.createdAt).toLocaleDateString(),
          },
        ]}
        searchKeys={['name', 'merchantCode']}
        onAdd={() => router.push('/merchants/new')}
        addButtonText="Add Merchant"
        actionButtons={[
          {
            name: 'Edit',
            action: (merchant) => router.push(`/merchants/${merchant.id}`),
          },
        ]}
      />
    </DashboardLayout>
  );
} 