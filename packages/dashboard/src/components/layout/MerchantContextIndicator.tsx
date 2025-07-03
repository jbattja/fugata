import { useMerchantContext } from '@/contexts/MerchantContext';
import { BuildingStorefrontIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

export function MerchantContextIndicator() {
  const { activeMerchant, clearActiveMerchant, canSwitchMerchant } = useMerchantContext();
  const router = useRouter();

  if (!activeMerchant) {
    return null;
  }

  const handleClearContext = () => {
    clearActiveMerchant();
    // Redirect to merchants list when clearing context
    router.push('/merchants');
  };

  return (
    <div className="flex items-center gap-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 w-full">
      <BuildingStorefrontIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
      <span className="text-sm font-medium text-blue-900 truncate">
        {activeMerchant.accountCode}
      </span>
      {canSwitchMerchant && (
        <button
          onClick={handleClearContext}
          className="text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-auto"
          title="Switch back to admin view"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
} 