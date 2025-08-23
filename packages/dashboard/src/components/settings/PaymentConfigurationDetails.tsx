import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCardIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { useMerchantContext } from '@/contexts/MerchantContext';
import { callApi } from '@/lib/api/api-caller';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import Form from '@/components/ui/forms/Form';
import { FormInput } from '@/components/ui/forms/FormInput';
import { FormSelect } from '@/components/ui/forms/FormSelect';
import { PaymentMethod, PaymentConfiguration, ProviderCredential, RoutingRule } from '@fugata/shared';

interface PaymentConfigurationDetailsProps {
  merchantId: string;
  configurationId: string;
}

export function PaymentConfigurationDetails({ merchantId, configurationId }: PaymentConfigurationDetailsProps) {
  const { activeMerchant } = useMerchantContext();
  const queryClient = useQueryClient();
  const [showAddRule, setShowAddRule] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form data state
  const [addRuleFormData, setAddRuleFormData] = useState({
    providerCredentialCode: '',
    paymentMethod: '' as PaymentMethod | string,
    weight: 1.0,
  });

  const [editRuleFormData, setEditRuleFormData] = useState({
    paymentMethod: '' as PaymentMethod | string,
    weight: 1.0,
  });

  // Fetch payment configuration details
  const { data: configuration, isLoading: configLoading, error: configError } = useQuery<PaymentConfiguration>({
    queryKey: ['payment-configuration', configurationId],
    queryFn: async () => {
      const response = await callApi(`/api/settings/payment-configuration`, {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch payment configuration');
      }
      const configs = await response.json();
      return configs.find((config: PaymentConfiguration) => config.id === configurationId);
    },
    enabled: !!configurationId,
  });

  // Fetch routing rules
  const { data: routingRules, isLoading: rulesLoading, error: rulesError } = useQuery<RoutingRule[]>({
    queryKey: ['routing-rules', configurationId],
    queryFn: async () => {
      const response = await callApi(`/api/settings/routing-rules?paymentConfigurationId=${configurationId}`, {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch routing rules');
      }
      return response.json();
    },
    enabled: !!configurationId,
  });

  // Fetch provider credentials for dropdown
  const { data: providerCredentials } = useQuery<ProviderCredential[]>({
    queryKey: ['provider-credentials'],
    queryFn: async () => {
      const response = await callApi('/api/provider-credentials', {}, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to fetch provider credentials');
      }
      return response.json();
    },
  });

  // Mutations
  const createRuleMutation = useMutation({
    mutationFn: async (data: { providerCredentialCode: string; paymentMethod: PaymentMethod | string; weight: number }) => {
      const response = await callApi('/api/settings/routing-rules', {
        method: 'POST',
        body: JSON.stringify({
          paymentConfigurationId: configurationId,
          ...data,
        }),
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to create routing rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules', configurationId] });
      setShowAddRule(false);
      setAddRuleFormData({ providerCredentialCode: '', paymentMethod: '' as PaymentMethod | string, weight: 1.0 });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create routing rule');
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async (data: { id: string; paymentMethod?: PaymentMethod | string; weight?: number; isActive?: boolean }) => {
      const response = await callApi('/api/settings/routing-rules', {
        method: 'PUT',
        body: JSON.stringify(data),
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to update routing rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules', configurationId] });
      setEditingRule(null);
      setEditRuleFormData({ paymentMethod: '' as PaymentMethod | string, weight: 1.0 });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update routing rule');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await callApi(`/api/settings/routing-rules?id=${ruleId}`, {
        method: 'DELETE',
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to delete routing rule');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules', configurationId] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to delete routing rule');
    },
  });

  const toggleRuleActiveMutation = useMutation({
    mutationFn: async (data: { id: string; isActive: boolean }) => {
      const response = await callApi('/api/settings/routing-rules', {
        method: 'PUT',
        body: JSON.stringify(data),
      }, activeMerchant);
      if (!response.ok) {
        throw new Error('Failed to update routing rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routing-rules', configurationId] });
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update routing rule');
    },
  });

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRuleMutation.mutate(addRuleFormData);
  };

  const handleEditRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id!, ...editRuleFormData });
    }
  };

  const handleEditRule = (rule: RoutingRule) => {
    setEditingRule(rule);
    setEditRuleFormData({
      paymentMethod: rule.paymentMethod || '' as PaymentMethod | string,
      weight: rule.weight || 1.0,
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this routing rule? This action cannot be undone.')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleToggleActive = async (ruleId: string, currentActive: boolean) => {
    toggleRuleActiveMutation.mutate({ id: ruleId, isActive: !currentActive });
  };

  if (configLoading || rulesLoading) {
    return <div className="text-center py-4">Loading configuration details...</div>;
  }

  if (configError || rulesError) {
    return <ErrorMessage message="Failed to load configuration details" errors="An unexpected error occurred while loading the configuration details." />;
  }

  if (!configuration) {
    return <ErrorMessage message="Payment configuration not found" errors="An unexpected error occurred while loading the configuration details." />;
  }

  // Payment method options
  const paymentMethodOptions = [
    { value: '', label: 'Any' },
    ...Object.values(PaymentMethod).map(method => ({
      value: method,
      label: method.replace(/_/g, ' '),
    }))
  ];

  // Helper function to display payment method
  const displayPaymentMethod = (method: string | undefined | null) => {
    if (!method || method === null || method === '') return 'Any';
    return method.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{configuration.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created: {configuration.createdAt ? new Date(configuration.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {configuration.isDefault && (
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                Default Configuration
              </span>
            )}
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              configuration.isDefault 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {configuration.isDefault ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <ErrorMessage message={error} errors={error} />
      )}

      {/* Add New Rule Form */}
      {showAddRule && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Form title="Add New Routing Rule" handleSubmit={handleAddRuleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormSelect
                label="Provider Credential"
                value={addRuleFormData.providerCredentialCode}
                onChange={(e) => setAddRuleFormData(prev => ({ ...prev, providerCredentialCode: e.target.value }))}
                required
                options={providerCredentials?.map(cred => ({
                  value: cred.accountCode,
                  label: `${cred.accountCode} (${cred.provider.accountCode})`,
                })) || []}
              />
              <FormSelect
                label="Payment Method"
                value={addRuleFormData.paymentMethod}
                onChange={(e) => setAddRuleFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | string }))}
                required
                options={paymentMethodOptions}
              />
              <FormInput
                label="Weight"
                value={addRuleFormData.weight.toString()}
                onChange={(e) => setAddRuleFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1.0 }))}
                type="number"
                required
                min="0"
                step="0.1"
                placeholder="1.0"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                disabled={createRuleMutation.isPending}
              >
                {createRuleMutation.isPending ? 'Creating...' : 'Create Rule'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddRule(false);
                  setAddRuleFormData({ providerCredentialCode: '', paymentMethod: '' as PaymentMethod | string, weight: 1.0 });
                }}
                disabled={createRuleMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Edit Rule Form */}
      {editingRule && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <Form title="Edit Routing Rule" handleSubmit={handleEditRuleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Credential
                </label>
                <p className="text-sm text-gray-600">
                  {editingRule.providerCredential?.accountCode} ({editingRule.providerCredential?.provider?.accountCode})
                </p>
              </div>
              <FormSelect
                label="Payment Method"
                value={editRuleFormData.paymentMethod}
                onChange={(e) => setEditRuleFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | string }))}
                required
                options={paymentMethodOptions}
              />
              <FormInput
                label="Weight"
                value={editRuleFormData.weight.toString()}
                onChange={(e) => setEditRuleFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 1.0 }))}
                type="number"
                required
                min="0"
                step="0.1"
                placeholder="1.0"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                type="submit"
                disabled={updateRuleMutation.isPending}
              >
                {updateRuleMutation.isPending ? 'Updating...' : 'Update Rule'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingRule(null);
                  setEditRuleFormData({ paymentMethod: '' as PaymentMethod | string, weight: 1.0 });
                }}
                disabled={updateRuleMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      )}

      {/* Routing Rules List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Routing Rules</h3>
          <Button
            onClick={() => setShowAddRule(true)}
            className="flex items-center gap-2"
            disabled={showAddRule || editingRule !== null}
          >
            <PlusIcon className="h-4 w-4" />
            Add Rule
          </Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {routingRules && routingRules.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {routingRules.map((rule) => (
                <li key={rule.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {displayPaymentMethod(rule.paymentMethod)}
                        </p>
                        <p className="text-xs text-gray-500">Payment Method</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {rule.providerCredential?.accountCode}
                        </p>
                        <p className="text-xs text-gray-500">Credential</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {rule.providerCredential?.provider?.accountCode}
                        </p>
                        <p className="text-xs text-gray-500">Provider</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {rule.weight}
                        </p>
                        <p className="text-xs text-gray-500">Weight</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => handleToggleActive(rule.id!, rule.isActive)}
                        className={`p-1 rounded ${
                          rule.isActive 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-yellow-600 hover:text-yellow-900'
                        }`}
                        title={rule.isActive ? "Deactivate rule" : "Activate rule"}
                        disabled={toggleRuleActiveMutation.isPending}
                      >
                        {rule.isActive ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <XMarkIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit rule"
                        disabled={editingRule !== null}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete rule"
                        disabled={deleteRuleMutation.isPending}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No routing rules found for this configuration.</p>
              <p className="text-sm text-gray-400 mt-1">
                Add routing rules to define how payments should be processed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">About Routing Rules</h4>
            <p className="text-sm text-blue-700 mt-1">
              Routing rules determine which payment provider and method to use for transactions. 
              Rules are evaluated in order of weight (higher weights have priority). 
              Only active rules are considered during payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
