import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PaymentStatusCard from '@/components/PaymentStatusCard';

interface ExpiredSessionData {
  returnUrl?: string;
  expiresAt?: string;
}

export default function ExpiredSessionPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<ExpiredSessionData | null>(null);

  useEffect(() => {
    // Try to get session data from localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');

    if (returnUrl) {
      setSessionData({ returnUrl });
    }
  }, []);

  const handleReturnToMerchant = () => {
    if (sessionData?.returnUrl) {
      window.location.href = sessionData.returnUrl;
    } else {
      // Fallback to a default page or close the window
      window.close();
    }
  };

  return (
    <PaymentStatusCard
      status="error"
      title="Session Expired"
      message="This payment session has expired and is no longer valid."
      returnUrl={sessionData?.returnUrl}
      onReturnHome={() => router.push('/')}
      onClose={() => window.close()}
    />
  );
}