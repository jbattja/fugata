import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import Form from '@/components/ui/forms/Form';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import { AccountType, getSettingsConfig, Merchant } from '@fugata/shared';

interface FormData {
  accountCode: string;
  description: string;
  settings: Record<string, string>;
}

export default function EditMerchant() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState<FormData>({
    accountCode: '',
    description: '',
    settings: {},
  });
  const [error, setError] = useState<JSX.Element | null>(null);
  const availableSettings = Object.keys(getSettingsConfig(AccountType.MERCHANT, null));

  const { data: merchant, isLoading } = useQuery<Merchant>({
    queryKey: ['merchant', id],
    queryFn: async () => {
      const response = await fetch(`/api/merchants/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch merchant');
      }
      return response.json();
    },
    enabled: !!id,
  });

  const updateMerchant = useMutation({
    mutationFn: async (data: { id: string; accountCode: string; description: string; settings: Record<string, string> }) => {
      const response = await fetch('/api/merchants', {
        method: 'PUT',
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

  useEffect(() => {
    if (merchant) {
      if (!merchant.settings) {
        merchant.settings = {};
      }
      setFormData({
        description: merchant.description,
        accountCode: merchant.accountCode,
        settings: merchant.settings,
      });
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMerchant.mutate({ id: id as string, ...formData });
  };


  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div>Loading merchant...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Form title="Edit Merchant" handleSubmit={handleSubmit}>
      <FormInput
          label="Merchant Code"
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
          availableKeys={availableSettings}
          onChange={(values) => setFormData(prev => ({ ...prev, settings: values }))}
        />
        <div className="flex justify-end space-x-4">
          <CancelButton  onClick={() => router.push('/merchants')}/>
          <SubmitButton
            isLoading={updateMerchant.isPending}
          >
            {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
          </SubmitButton>
        </div>
      </Form>
      {error}
    </DashboardLayout>
  );
} 