import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCardIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface PaymentConfiguration {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MerchantPaymentConfigurationsProps {
  merchantId: string;
}

export function MerchantPaymentConfigurations({ merchantId }: MerchantPaymentConfigurationsProps) {
  const [showAddConfig, setShowAddConfig] = useState(false);

  const { data: configurations, isLoading, error } = useQuery<PaymentConfiguration[]>({
    queryKey: ['merchant-payment-configurations', merchantId],
    queryFn: async () => {
      const response = await fetch(`/api/merchants/${merchantId}/payment-configurations`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment configurations');
      }
      return response.json();
    },
    enabled: !!merchantId,
  });

  const handleAddConfiguration = async () => {
    // TODO: Implement add configuration functionality
    console.log('Adding payment configuration');
    setShowAddConfig(false);
  };

  const handleEditConfiguration = async (configId: string) => {
    // TODO: Implement edit configuration functionality
    console.log('Editing configuration:', configId);
  };

  const handleDeleteConfiguration = async (configId: string) => {
    // TODO: Implement delete configuration functionality
    console.log('Deleting configuration:', configId);
  };

  const handleSaveChanges = async () => {
    // TODO: Implement save changes functionality
    console.log('Saving payment configuration changes');
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading payment configurations...</div>;
  }

  if (error) {
    return <ErrorMessage message="Failed to load payment configurations" errors="An error occurred while loading payment configurations." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Configurations</h3>
      </div>

      {showAddConfig && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Payment Configuration</h4>
          <p className="text-sm text-gray-600 mb-4">
            This feature is coming soon. You'll be able to create payment configurations with custom routing rules.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddConfig(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {configurations?.map((config) => (
            <li key={config.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{config.name}</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(config.createdAt).toLocaleDateString()}
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
                    onClick={() => handleEditConfiguration(config.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit configuration"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConfiguration(config.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete configuration"
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
        >
          <PlusIcon className="h-4 w-4" />
          Add Configuration
        </Button>
      </div>
    </div>
  );
} 