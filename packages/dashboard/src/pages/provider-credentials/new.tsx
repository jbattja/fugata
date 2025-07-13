import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import { FormSelect } from '@/components/ui/forms/FormSelect';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import Form from '@/components/ui/forms/Form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AccountType, getSettingsConfig, Provider } from '@fugata/shared';
import { callApi } from '@/lib/api/api-caller';

export default function NewProviderCredential() {
  const { data: session } = useSession();
  const router = useRouter();
  const providerData = router.query.provider as string;
  const provider = useMemo(() => {
    if (providerData) {
      return JSON.parse(atob(providerData)) as Provider;
    }
    return null;
  }, [router.query.provider]);
  const providerCode = provider?.accountCode || router.query.providerCode as string | undefined;

  const [formData, setFormData] = useState({
    accountCode: '',
    description: '',
    providerCode: providerCode || '',
    settings: {} as Record<string, string>,
  });
  const [error, setError] = useState<JSX.Element | null>(null);
  let availableSettings: string[] = [];
  try {
    availableSettings = Object.keys(getSettingsConfig(AccountType.PROVIDER_CREDENTIAL, providerCode || null));
  } catch (error) {
    console.error('Failed to fetch available settings:', error);
  }

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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await callApi('/api/provider-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <Form title="New Provider Credential" handleSubmit={handleSubmit}>
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
            onChange={(values) => setFormData(prev => ({ ...prev, settings: values }))}
            availableKeys={availableSettings}
          />

          <div className="flex justify-end gap-4">
            <CancelButton onClick={() => router.back()}>Cancel</CancelButton>
            <SubmitButton type="submit" isLoading={createMutation.isPending}>
              Create Credential
            </SubmitButton>
          </div>
      </Form>
      {error}
    </DashboardLayout>
  );
} 