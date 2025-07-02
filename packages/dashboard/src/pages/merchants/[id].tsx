import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { MerchantGeneralSettings } from '@/components/merchants/MerchantGeneralSettings';
import { MerchantUsers } from '@/components/merchants/MerchantUsers';
import { MerchantPaymentConfigurations } from '@/components/merchants/MerchantPaymentConfigurations';
import { AccountType, getSettingsConfig, Merchant } from '@fugata/shared';
import { CogIcon, UserIcon, CreditCardIcon } from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState(0);
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

  useEffect(() => {
    if (merchant) {
      if (!merchant.settings) {
        merchant.settings = {};
      }
      setFormData({
        description: merchant.description ?? '',
        accountCode: merchant.accountCode,
        settings: merchant.settings,
      });
    }
  }, [merchant]);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading merchant...</div>
        </div>
      </DashboardLayout>
    );
  }

  const tabItems: TabItem[] = [
    {
      id: 'general',
      label: 'General Settings',
      icon: <CogIcon className="h-4 w-4" />,
      content: (
        <MerchantGeneralSettings
          merchantId={id as string}
          initialData={formData}
          availableSettings={availableSettings}
        />
      ),
    },
    {
      id: 'users',
      label: 'Users',
      icon: <UserIcon className="h-4 w-4" />,
      content: <MerchantUsers merchantId={id as string} />,
    },
    {
      id: 'payment-configurations',
      label: 'Payment Configurations',
      icon: <CreditCardIcon className="h-4 w-4" />,
      content: <MerchantPaymentConfigurations merchantId={id as string} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Merchant: {merchant?.accountCode}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage merchant settings, users, and payment configurations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Tabs
              items={tabItems}
              defaultIndex={activeTab}
              variant="underline"
              className="p-6"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 