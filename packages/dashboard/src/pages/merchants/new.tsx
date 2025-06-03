import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import Form from '@/components/ui/forms/Form';

export default function NewMerchant() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    merchantCode: '',
  });

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
        throw new Error('Failed to create merchant');
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
        <div className="flex justify-end space-x-4">
          <CancelButton onClick={() => router.push('/merchants')}/>
          <SubmitButton
            isLoading={createMerchant.isPending}
          >
            {createMerchant.isPending ? 'Creating...' : 'Create Merchant'}
          </SubmitButton>
        </div>
      </Form>
    </DashboardLayout>
  );
} 