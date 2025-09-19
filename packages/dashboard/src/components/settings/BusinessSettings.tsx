import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { FormInput } from '@/components/ui/forms/FormInput';
import { KeyValueInput } from '@/components/ui/forms/KeyValueInput';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useMerchantContext } from '@/contexts/MerchantContext';
import { callApi } from '@/lib/api/api-caller';
import { AccountType } from '@fugata/shared';

interface BusinessSettingsProps {
  merchantId: string;
  initialData: {
    accountCode: string;
    description: string;
    settings: Record<string, string>;
  };
  availableSettings: string[];
}

export function BusinessSettings({ merchantId, initialData, availableSettings }: BusinessSettingsProps) {
  const router = useRouter();
  const { activeMerchant } = useMerchantContext();
  const [formData, setFormData] = useState(initialData);
  const [error, setError] = useState<JSX.Element | null>(null);

  const updateMerchant = useMutation({
    mutationFn: async (data: { id: string; accountCode: string; description: string; settings: Record<string, string> }) => {
      const response = await callApi('/api/settings/business-settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }, activeMerchant);
      if (!response.ok) {
        const errorData = await response.json();
        setError(
          <ErrorMessage message={errorData.message} errors={errorData.errors} />
        );
        throw new Error(errorData.message || 'Failed to update merchant');
      }
      return response.json();
    },
    onSuccess: () => {
      setError(null);
      // Stay on the same page if in merchant context, otherwise go to merchants list
      if (activeMerchant) {
        router.push('/settings/business-settings');
      } else {
        router.push('/merchants');
      }
    },
  });

  const handleSave = async () => {
    updateMerchant.mutate({ id: merchantId, ...formData });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">General Information</h3>
        <div className="space-y-6">
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
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Settings</h3>
        <KeyValueInput
          label="Settings"
          pairs={Object.entries(formData.settings).map(([key, value]) => ({ key, value: String(value) }))}
          availableKeys={availableSettings}
          accountType={AccountType.MERCHANT}
          useToggleForBoolean={true}
          onChange={(values) => setFormData((prev: any) => ({ ...prev, settings: values }))}
        />
      </div>

      {error && (
        <div className="mt-6">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <CancelButton onClick={() => router.push('/merchants')} />
        <SubmitButton
          onClick={handleSave}
          isLoading={updateMerchant.isPending}
        >
          {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
        </SubmitButton>
      </div>
    </div>
  );
} 