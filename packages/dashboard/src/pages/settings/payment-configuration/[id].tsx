import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useMerchantContext } from '@/contexts/MerchantContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { PaymentConfigurationDetails } from '@/components/settings/PaymentConfigurationDetails';

export default function PaymentConfigurationDetailsPage() {
  const { data: session } = useSession();
  const { activeMerchant, isInMerchantContext } = useMerchantContext();
  const router = useRouter();
  const { id } = router.query;

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

  if (!id || typeof id !== 'string') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Invalid payment configuration ID</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Configuration Details
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Manage routing rules and settings for this payment configuration
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <PaymentConfigurationDetails 
              merchantId={activeMerchant.id!} 
              configurationId={id} 
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
