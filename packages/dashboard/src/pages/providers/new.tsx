import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import Form from '@/components/ui/forms/Form';

export default function NewProvider() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    providerCode: '',
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/providers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create provider');
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
          <div className="flex justify-end space-x-4">
            <CancelButton onClick={() => router.push('/providers')}/>
            <SubmitButton
              isLoading={createProviderMutation.isPending}
            >
              {createProviderMutation.isPending ? 'Creating...' : 'Create Provider'}
            </SubmitButton>
          </div>
      </Form>
    </DashboardLayout>
  );
} 