import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import Form from '@/components/ui/forms/Form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import { getSettingsConfig, AccountType } from '@fugata/shared';
import { callApi } from '@/lib/api/api-caller';

interface FormData {
  accountCode: string;
  description: string;
  settings: Record<string, string>;
}

export default function NewProvider() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    accountCode: '',
    description: '',
    settings: {},
  });
  const [error, setError] = useState<JSX.Element | null>(null);
  const availableSettings = Object.keys(getSettingsConfig(AccountType.PROVIDER, null));

  const createProviderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await callApi('/api/providers', {
        method: 'POST',
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
      router.push('/providers');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createProviderMutation.mutate(formData);
  };

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <Form title="Add New Provider" handleSubmit={handleSubmit}>
        <FormInput
          label="Account Code"
          value={formData.accountCode}
          onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
          required
        />
        <FormInput
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <KeyValueInput
          label="Settings"
          pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value }))}
          onChange={(values) => setFormData(prev => ({ ...prev, settings: values }))}
          availableKeys={availableSettings}
          accountType={AccountType.PROVIDER}
          useToggleForBoolean={true}
        />
          <div className="flex justify-end space-x-4">
            <CancelButton onClick={() => router.push('/providers')}/>
            <SubmitButton
              isLoading={createProviderMutation.isPending}
            >
              {createProviderMutation.isPending ? 'Creating...' : 'Create Provider'}
            </SubmitButton>
          </div>
      </Form>
      {error}
    </DashboardLayout>
  );
} 