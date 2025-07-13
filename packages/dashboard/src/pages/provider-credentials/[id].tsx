import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import { FormSelect } from '@/components/ui/forms/FormSelect';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import Form from '@/components/ui/forms/Form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { getSettingsConfig, AccountType, Provider, ProviderCredential } from '@fugata/shared';
import { callApi } from '@/lib/api/api-caller';

interface FormData {
  accountCode: string;
  description: string;
  providerCode: string;
  settings: Record<string, string>;
}

export default function EditProviderCredential() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const providerData = router.query.provider as string;
  const provider = useMemo(() => {
    if (providerData) {
      return JSON.parse(atob(providerData)) as Provider;
    }
    return null;
  }, [router.query.provider]);
  const providerCode = provider?.accountCode || router.query.providerCode as string | undefined;

  const [error, setError] = useState<JSX.Element | null>(null);
  const availableSettings = Object.keys(getSettingsConfig(AccountType.PROVIDER_CREDENTIAL, providerCode || null));

  const [formData, setFormData] = useState<FormData>({
    accountCode: '',
    description: '',
    providerCode: '',
    settings: {},
  });

  const { data: credential, isLoading: isLoadingCredential } = useQuery<ProviderCredential>({
    queryKey: ['provider-credential', id],
    queryFn: async () => {
      const response = await callApi(`/api/provider-credentials/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch provider credential');
      }
      return response.json();
    },
    enabled: !!session && !!id,
  });

  // Update form data when credential is loaded
  useEffect(() => {
    if (credential) {
      setFormData({
        accountCode: credential.accountCode,
        description: credential.description ?? '',
        providerCode: credential.provider?.accountCode || '',
        settings: credential.settings || {},
      });
    }
  }, [credential]);

  const { data: providers } = useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const response = await callApi('/api/providers');
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      return response.json();
    },
    enabled: !!session,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await callApi(`/api/provider-credentials/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...data, id}),
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
      router.push('/provider-credentials' + (providerData ? `?provider=${providerData}` : ''));
    },
  });

  if (!session) {
    return null;
  }

  if (isLoadingCredential) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <Form title="Edit Provider Credential" handleSubmit={handleSubmit}>
        <FormInput
            label="Credential Code"
            value={formData.accountCode}
            onChange={(e) => setFormData(prev => ({ ...prev, accountCode: e.target.value }))}
            required
          />

          <FormSelect
            label="Provider"
            value={formData.providerCode}
            onChange={(e) => setFormData(prev => ({ ...prev, providerCode: e.target.value }))}
            options={providers?.map(provider => ({
              value: provider.accountCode,
              label: `${provider.accountCode}`
            })) || []}
            required
          />

          <KeyValueInput
            label="Settings"
            pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value }))}
            onChange={(settings) => setFormData(prev => ({ ...prev, settings }))}
            availableKeys={availableSettings}
          />

          <div className="flex justify-end gap-4">
            <CancelButton onClick={() => router.back()}>Cancel</CancelButton>
            <SubmitButton type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </SubmitButton>
          </div>
      </Form>
      {error}
    </DashboardLayout>
  );
} 