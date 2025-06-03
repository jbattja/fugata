import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Provider } from '@/lib/api/settings';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import Form from '@/components/ui/forms/Form';
import { FormInput } from '@/components/ui/forms/FormInput';

export default function EditProvider() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState({
    name: '',
    providerCode: '',
  });

  const { data: provider, isLoading: isLoadingProvider } = useQuery<Provider>({
    queryKey: ['provider', id],
    queryFn: async () => {
      const response = await fetch(`/api/providers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider');
      }
      return response.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        providerCode: provider.providerCode,
      });
    }
  }, [provider]);

  const updateProviderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/providers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update provider');
      }

      return response.json();
    },
    onSuccess: () => {
      router.push('/providers');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProviderMutation.mutate(formData);
  };

  if (!session) {
    return null;
  }

  if (isLoadingProvider) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Form title="Edit Provider" handleSubmit={handleSubmit}>
        <FormInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormInput
          label="Provider Code"
          value={formData.providerCode}
          onChange={(e) => setFormData({ ...formData, providerCode: e.target.value })}
          required
        />

          <div className="flex justify-end space-x-4">
            <CancelButton onClick={() => router.push('/providers')}/>
            <SubmitButton
              isLoading={updateProviderMutation.isPending}
            >
              {updateProviderMutation.isPending ? 'Saving...' : 'Save Changes'}
            </SubmitButton>
          </div>
      </Form>
    </DashboardLayout>
  );
} 