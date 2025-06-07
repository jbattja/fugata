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

interface FormData {
  name: string;
  merchantCode: string;
  settings: Record<string, string>;
}

export default function NewMerchant() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    merchantCode: '',
    settings: {} as Record<string, string>,
  });
  const [error, setError] = useState<JSX.Element | null>(null);
  const availableSettings = Object.keys(getSettingsConfig(AccountType.MERCHANT, null));

  const createMerchant = useMutation({
    mutationFn: async (data: { name: string; merchantCode: string }) => {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      router.push('/merchants');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMerchant.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <Form title="Add New Merchant" handleSubmit={handleSubmit}>
        <FormInput
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormInput
          label="Merchant Code"
          value={formData.merchantCode}
          onChange={(e) => setFormData({ ...formData, merchantCode: e.target.value })}
          required
        />
        <KeyValueInput
          label="Settings"
          pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value }))}
          onChange={(values) => setFormData(prev => ({ ...prev, settings: values }))}
          availableKeys={availableSettings}
        />
        <div className="flex justify-end space-x-4">
          <CancelButton onClick={() => router.push('/merchants')}/>
          <SubmitButton
            isLoading={createMerchant.isPending}
          >
            {createMerchant.isPending ? 'Creating...' : 'Create Merchant'}
          </SubmitButton>
        </div>
      </Form>
      {error}
    </DashboardLayout>
  );
} 