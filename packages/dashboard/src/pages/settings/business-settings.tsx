import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMerchantContext } from '@/contexts/MerchantContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { getSettingsConfig, AccountType } from '@fugata/shared';

export default function MerchantSettings() {
  const { data: session } = useSession();
  const { activeMerchant, isInMerchantContext } = useMerchantContext();
  const router = useRouter();

  // Redirect if not in merchant context
  useEffect(() => {
    if (!isInMerchantContext) {
      router.push('/merchants');
    }
  }, [isInMerchantContext, router]);

  if (!session) {
    return null;
  }

  if (!isInMerchantContext || !activeMerchant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Redirecting...</div>
        </div>
      </DashboardLayout>
    );
  }

  const availableSettings = Object.keys(getSettingsConfig(AccountType.MERCHANT, null));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Business Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your merchant account settings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <BusinessSettings
              merchantId={activeMerchant.id!}
              initialData={{
                accountCode: activeMerchant.accountCode,
                description: activeMerchant.description || '',
                settings: activeMerchant.settings || {},
              }}
              availableSettings={availableSettings}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 