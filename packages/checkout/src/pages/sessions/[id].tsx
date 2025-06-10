import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaymentForm } from '@/components/PaymentForm';
import { formatAmount } from '@/lib/utils/currency';

interface SessionData {
  id: string;
  reference: string;
  amount: {
    value: number;
    currency: string;
  };
  status: string;
  orderLines: {}[];
}

export default function SessionCheckout() {
  const router = useRouter();
  const { id } = router.query;
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const { data: session, error, isLoading } = useQuery<SessionData>({
    queryKey: ['session', id],
    queryFn: async () => {
      if (!id) throw new Error('No session ID provided');
      const response = await fetch(`/api/sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const session = await response.json();
      return session;
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setIsValid(false);
    } else if (session) {
      setIsValid(true);
    }
  }, [session, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Session</h1>
          <p className="text-gray-400">The checkout session you're trying to access is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Amount/Product Card */}
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-4xl font-bold mb-2">{formatAmount(session?.amount.value ?? 0, session?.amount.currency ?? 'USD')}</div>
          <div className="text-gray-700 text-base">{session?.reference} 
            {session?.orderLines && <a href="#" className="text-blue-600 hover:underline font-medium ml-2">View details <span className="inline-block align-middle">▼</span></a>} 
            </div> 
        </div>
        {/* Payment Form Card */}
        <div className="bg-white rounded-xl shadow p-8">
          <div className="text-lg font-semibold mb-4">Payment method</div>
          <PaymentForm sessionId={id as string} />
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center mt-8 select-none">Powered by Fugata</div>
    </div>
  );
} 