import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Merchant } from '@/lib/api/settings';
import { CancelButton, SubmitButton } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/forms/FormInput';
import Form from '@/components/ui/forms/Form';

export default function EditMerchant() {
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState({
    name: '',
    merchantCode: '',
  });

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
    mutationFn: async (data: { id: string; name: string; merchantCode: string }) => {
      const response = await fetch('/api/merchants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update merchant');
      }
      return response.json();
    },
    onSuccess: () => {
      router.push('/merchants');
    },
  });

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name,
        merchantCode: merchant.merchantCode,
      });
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMerchant.mutate({ id: id as string, ...formData });
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
          <CancelButton  onClick={() => router.push('/merchants')}/>
          <SubmitButton
            isLoading={updateMerchant.isPending}
          >
            {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
          </SubmitButton>
        </div>
      </Form>
    </DashboardLayout>
  );
} 