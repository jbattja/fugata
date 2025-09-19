import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Payment, PaymentStatus, SharedLogger } from '@fugata/shared';
import { jwtService } from '@/lib/auth/jwt.service';
import PaymentStatusCard from '@/components/PaymentStatusCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ConfirmPageProps {
  paymentId: string;
  from?: string;
  error?: string;
}

export default function ConfirmPage({ paymentId, from, error }: ConfirmPageProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmError, setConfirmError] = useState<string | null>(error || null);

  useEffect(() => {
    if (error) {
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      try {
        setLoading(true);
        
        // Get URL parameters from the current page
        const urlParams = new URLSearchParams(window.location.search);
        const params: Record<string, any> = {};
        urlParams.forEach((value, key) => {
          if (key !== 'from') { // Exclude the 'from' parameter as it's for our internal use
            params[key] = value;
          }
        });

        // Call the payment processor to confirm the payment
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId,
            partnerName: from,
            urlParams: params,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setConfirmError(errorData.error || 'Failed to confirm payment');
          return;
        }

        const confirmedPayment = await response.json();
        setPayment(confirmedPayment);
        
        SharedLogger.log(`Payment ${paymentId} confirmed with status: ${confirmedPayment.status}`, undefined, 'ConfirmPage');
      } catch (err) {
        console.error('Failed to confirm payment:', err);
        setConfirmError('Failed to confirm payment');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [paymentId, error]);

  if (loading) {
    return <LoadingSpinner message="Confirming payment..." />;
  }

  if (confirmError) {
    return (
      <PaymentStatusCard
        status="error"
        title="Payment Confirmation Failed"
        message={confirmError}
        onReturnHome={() => router.push('/')}
        onClose={() => window.close()}
      />
    );
  }

  if (!payment) {
    return (
      <PaymentStatusCard
        status="not-found"
        title="Payment Not Found"
        message="We couldn't find the payment you're looking for."
        onReturnHome={() => router.push('/')}
        onClose={() => window.close()}
      />
    );
  }

  // Show success page
  if (payment.status === PaymentStatus.AUTHORIZED || payment.status === PaymentStatus.CAPTURED) {
    return (
      <PaymentStatusCard
        status="success"
        title="Payment Successful!"
        message={`Your payment has been ${payment.status === PaymentStatus.CAPTURED ? 'captured' : 'authorized'} successfully.`}
        paymentId={payment.paymentId}
        amount={payment.amount}
        returnUrl={payment.returnUrl}
        onClose={() => window.close()}
      />
    );
  }

  // Show refused page
  if (payment.status === PaymentStatus.REFUSED) {
    return (
      <PaymentStatusCard
        status="refused"
        title="Payment Refused"
        message="Unfortunately, your payment could not be processed."
        paymentId={payment.paymentId}
        amount={payment.amount}
        refusalReason={payment.refusalReason}
        returnUrl={payment.returnUrl}
        onTryAgain={() => router.back()}
        onClose={() => window.close()}
      />
    );
  }

  // Show pending page for other statuses
  return (
    <PaymentStatusCard
      status="pending"
      title="Payment Pending"
      message="Your payment is being processed. Please check back later."
      paymentId={payment.paymentId}
      amount={payment.amount}
      onReturnHome={() => router.push('/')}
      onClose={() => window.close()}
    />
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { paymentId } = context.params as { paymentId: string };
  const { from } = context.query;

  if (!paymentId) {
    return {
      props: {
        paymentId: '',
        error: 'No payment ID provided'
      }
    };
  }

  return {
    props: {
      paymentId,
      from: from as string || undefined
    }
  };
};