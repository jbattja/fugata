import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PaymentSession } from '@fugata/shared';
import PaymentStatusCard from '@/components/PaymentStatusCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PaymentData {
  paymentId: string;
  status: string;
  amount: {
    value: number;
    currency: string;
  };
  reference: string;
  returnUrl?: string;
}

export default function PaymentPending() {
  const router = useRouter();
  const { paymentId, sessionId, returnUrl } = router.query;
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (paymentId) {
        // Load payment data from localStorage (from payment flow)
        const paymentData = localStorage.getItem(`payment_${paymentId}`);
        if (paymentData) {
          setPayment(JSON.parse(paymentData));
        }
      } else if (sessionId) {
        // Load session data (from session status redirect)
        try {
          const response = await fetch(`/api/sessions/${sessionId}`);
          if (response.ok) {
            const sessionData = await response.json();
            setSession(sessionData);
            // Create payment-like data from session
            setPayment({
              paymentId: sessionId as string,
              status: 'PENDING',
              amount: sessionData.amount,
              reference: sessionData.reference,
              returnUrl: returnUrl as string || sessionData.returnUrl
            });
          }
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [paymentId, sessionId, returnUrl]);

  if (loading) {
    return <LoadingSpinner message="Loading payment details..." />;
  }

  return (
    <PaymentStatusCard
      status="pending"
      title="Payment Pending"
      message="Your payment is being processed. Please wait while we confirm your transaction."
      paymentId={payment?.paymentId}
      amount={payment?.amount}
      returnUrl={payment?.returnUrl}
      onClose={() => window.close()}
    />
  );
}