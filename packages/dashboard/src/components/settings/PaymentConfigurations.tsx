import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCardIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useMerchantContext } from '@/contexts/MerchantContext';
import { callApi } from '@/lib/api/api-caller';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useRouter } from 'next/router';
import Form from '@/components/ui/forms/Form';
import { FormInput } from '@/components/ui/forms/FormInput';
import { FormCheckbox } from '@/components/ui/forms/FormCheckbox';
import { PaymentConfiguration } from '@fugata/shared';

interface PaymentConfigurationsProps {
  merchantId: string;
}

export function PaymentConfigurations({ merchantId }: PaymentConfigurationsProps) {
  const { activeMerchant } = useMerchantContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAddConfig, setShowAddConfig] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfiguration | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [addFormData, setAddFormData] = useState({
    name: '',
    isDefault: false,
  });
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    isDefault: false,
  });

  const { data: configurations, isLoading, error: fetchError } = useQuery<PaymentConfiguration[]>({
    queryKey: ['merchant-payment-configurations', merchantId],
    queryFn: async () => {
      const response = await callApi(`/api/settings/payment-configuration`, {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch payment configurations');
      }
      return response.json();
    },
    enabled: !!merchantId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; isDefault: boolean }) => {
      const response = await callApi('/api/settings/payment-configuration', {
        method: 'POST',
        body: JSON.stringify(data),
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to create payment configuration');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-payment-configurations', merchantId] });
      setShowAddConfig(false);
      setAddFormData({ name: '', isDefault: false });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create payment configuration');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name?: string; isDefault?: boolean }) => {
      const response = await callApi('/api/settings/payment-configuration', {
        method: 'PUT',
        body: JSON.stringify(data),
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to update payment configuration');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-payment-configurations', merchantId] });
      setEditingConfig(null);
      setEditFormData({ name: '', isDefault: false });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update payment configuration');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (configId: string) => {
      const response = await callApi(`/api/settings/payment-configuration?id=${configId}`, {
        method: 'DELETE',
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to delete payment configuration');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-payment-configurations', merchantId] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to delete payment configuration');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(addFormData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id!, ...editFormData });
    }
  };

  const handleEditConfiguration = (config: PaymentConfiguration) => {
    setEditingConfig(config);
    setEditFormData({
      name: config.name,
      isDefault: config.isDefault,
    });
  };

  const handleDeleteConfiguration = async (configId: string, isDefault: boolean) => {
    if (isDefault) {
      setError('Cannot delete the default payment configuration');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this payment configuration? This action cannot be undone.')) {
      deleteMutation.mutate(configId);
    }
  };

  const handleViewConfiguration = (configId: string) => {
    router.push(`/settings/payment-configuration/${configId}`);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading payment configurations...</div>;
  }

  if (fetchError) {
    return <ErrorMessage message="Failed to load payment configurations" errors="An unexpected error occurred while loading the payment configurations." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Configurations</h3>
      </div>

      {error && (
        <ErrorMessage message={error} errors={error} />
      )}

      {showAddConfig && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Form title="Add New Payment Configuration" handleSubmit={handleAddSubmit}>
            <FormInput
              label="Configuration Name"
              value={addFormData.name}
              onChange={(e) => setAddFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter configuration name"
            />
            <FormCheckbox
              label="Set as default configuration"
              checked={addFormData.isDefault}
              onChange={(e) => setAddFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
            />
            <p className="text-sm text-gray-500">This configuration will be used as the default for new payments</p>
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Configuration'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddConfig(false);
                  setAddFormData({ name: '', isDefault: false });
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      {editingConfig && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Form title="Edit Payment Configuration" handleSubmit={handleEditSubmit}>
            <FormInput
              label="Configuration Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Enter configuration name"
            />
            <FormCheckbox
              label="Set as default configuration"
              checked={editFormData.isDefault}
              onChange={(e) => setEditFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
            />
            <p className="text-sm text-gray-500">This configuration will be used as the default for new payments</p>
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Configuration'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingConfig(null);
                  setEditFormData({ name: '', isDefault: false });
                }}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {configurations?.map((config) => (
            <li key={config.id} className="px-6 py-4">
              <div 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => handleViewConfiguration(config.id!)}
              >
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{config.name}</p>
                    <p className="text-sm text-gray-500">
                      Created: {config.createdAt ? new Date(config.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.isDefault && (
                    <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Default
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditConfiguration(config);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit configuration"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfiguration(config.id!, config.isDefault);
                    }}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                    title={config.isDefault ? "Cannot delete default configuration" : "Delete configuration"}
                    disabled={config.isDefault}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {(!configurations || configurations.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No payment configurations found for this merchant.</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a payment configuration to start processing payments.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          onClick={() => setShowAddConfig(true)}
          className="flex items-center gap-2"
          disabled={showAddConfig || editingConfig !== null}
        >
          <PlusIcon className="h-4 w-4" />
          Add Configuration
        </Button>
      </div>
    </div>
  );
} 