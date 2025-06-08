import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { ProviderCredential } from '@fugata/shared';
import { useRouter } from 'next/router';
import { DataTable } from '@/components/ui/DataTable';

export default function ProviderCredentials() {
  const { data: session } = useSession();
  const router = useRouter();
  const providerCode = router.query.providerCode as string | undefined;

  const { data: credentials, isLoading, error } = useQuery<ProviderCredential[]>({
    queryKey: ['provider-credentials', providerCode],
    queryFn: async () => {
      const response = await fetch('/api/provider-credentials' + (providerCode ? `?providerCode=${providerCode}` : ''));
      if (!response.ok) {
        throw new Error('Failed to fetch provider credentials');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    },
    enabled: !!session,
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
        <div className="text-red-500">Error loading provider credentials</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DataTable
        title="Provider Credentials"
        description="A list of all provider credentials including their provider details."
        data={credentials || []}
        columns={[
          { header: 'Credential Code', accessor: 'providerCredentialCode' },
          { header: 'Provider', accessor: (cred) => cred.provider?.providerCode },
          {
            header: 'Status',
            accessor: (cred) => (
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                cred.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {cred.isActive ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            header: 'Created At',
            accessor: (cred) => new Date(cred.createdAt).toLocaleDateString(),
          },
        ]}
        searchKeys={['providerCredentialCode', 'provider.providerCode']}
        onAdd={() => router.push('/provider-credentials/new' + (providerCode ? `?providerCode=${providerCode}` : ''))}
        addButtonText="Add Credential"
        actionButtons={[
          {
            name: 'Edit',
            action: (cred) => router.push(`/provider-credentials/${cred.id}?providerCode=${providerCode}`),
          },
        ]}
      />
    </DashboardLayout>
  );
} 