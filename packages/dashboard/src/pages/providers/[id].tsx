import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import Form from '@/components/ui/forms/Form';
import { FormInput } from '@/components/ui/forms/FormInput';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import { getSettingsConfig, AccountType, Provider } from '@fugata/shared';

interface FormData {
  name: string;
  providerCode: string;
  settings: Record<string, string>;
}

export default function EditProvider() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [error, setError] = useState<JSX.Element | null>(null);
  const availableSettings = Object.keys(getSettingsConfig(AccountType.PROVIDER, null));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    providerCode: '',
    settings: {},
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
      if (!provider.settings) {
        provider.settings = {};
      }
      setFormData({
        name: provider.name,
        providerCode: provider.providerCode,
        settings: provider.settings,
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
        const errorData = await response.json();
        setError(
          <ErrorMessage message={errorData.message} errors={errorData.errors} />
        );
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

        <KeyValueInput
            label="Settings"
            pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value }))}
            onChange={(values) => setFormData(prev => ({ ...prev, settings: values }))}
            availableKeys={availableSettings}
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
      {error}
    </DashboardLayout>
  );
} 