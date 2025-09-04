import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PaymentSession } from '@fugata/shared';

interface PaymentData {
  paymentId: string;
  status: string;
  amount: {
    value: number;
    currency: string;
  };
  reference: string;
  refusalReason?: string;
  returnUrl?: string;
}

export default function PaymentRefused() {
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
              status: 'REFUSED',
              amount: sessionData.amount,
              reference: sessionData.reference,
              refusalReason: sessionData.refusalReason,
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Refused Card */}
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Refused</h1>
          <p className="text-gray-600 mb-4">
            Unfortunately, your payment could not be processed.
          </p>
          {payment?.refusalReason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {payment.refusalReason}
              </p>
            </div>
          )}
          {payment && (
            <div className="text-sm text-gray-500 space-y-1">
              <p>Reference: {payment.reference}</p>
              <p>Amount: {payment.amount?.value} {payment.amount?.currency}</p>
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          <button
            onClick={() => router.back()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
          >
            Try Again
          </button>
          {payment?.returnUrl && (
            <button
              onClick={() => window.location.href = payment.returnUrl!}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
            >
              Return to Merchant
            </button>
          )}
          <button
            onClick={() => window.close()}
            className="text-gray-600 hover:text-gray-500 font-medium"
          >
            Close this window
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center mt-8 select-none">Powered by Fugata</div>
    </div>
  );
}
