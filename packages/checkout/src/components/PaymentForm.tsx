import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PaymentMethod, CardDetails, PaymentSession, PaymentStatus } from '@fugata/shared';
import { ErrorMessage } from './ErrorMessage';

const paymentSchema = z.object({
  cardNumber: z.string()
    .min(19, 'Card number must be 16 digits') // 16 digits + 3 spaces = 19 characters
    .max(19, 'Card number must be 16 digits')
    .regex(/^\d{4} \d{4} \d{4} \d{4}$/, 'Card number must be 16 digits'),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format'),
  cvc: z.string()
    .min(3, 'CVC must be 3 digits')
    .max(4, 'CVC must be 4 digits')
    .regex(/^\d+$/, 'CVC must contain only digits'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  sessionId: string;
  sessionData?: PaymentSession;
}

export function PaymentForm({ sessionId, sessionData }: PaymentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const expiryDateValue = watch('expiryDate');
  const cardNumberValue = watch('cardNumber');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Add spaces after every 4 digits
    if (value.length > 0) {
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    setValue('cardNumber', value);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 1) {
      // Handle first digit logic
      if (value.length === 1) {
        if (value === '0') {
          value = '0';
        } else if (value === '1') {
          value = '1';
        } else if (value >= '2' && value <= '9') {
          value = `0${value}`;
        }
      } else if (value.length === 2) {
        const firstDigit = value[0];
        const secondDigit = value[1];
        
        if (firstDigit === '1') {
          if (secondDigit > '2') {
            // If 1X where X > 2, replace with 01X
            value = `01${secondDigit}`;
          }
        } else if (firstDigit === '0') {
          if (secondDigit === '0') {
            // 00 is invalid, keep as 0
            value = '0';
          }
        }
      }
      
      // Add slash after 2 digits
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
    }
    
    setValue('expiryDate', value);
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!sessionData) {
      setError('Session data not available. Please refresh the page.');
      return;
    }

    setError(null); // Clear any previous errors

    try {
      // Create a complete PaymentInstrument object - this makes it future-proof for other payment methods
      const paymentInstrument = {
        paymentMethod: PaymentMethod.CARD,
        instrumentDetails: {
          expiryMonth: parseInt(data.expiryDate.split('/')[0]),
          expiryYear: parseInt('20' + data.expiryDate.split('/')[1]),
          number: data.cardNumber.replace(/\s/g, ''), // Remove spaces from card number
          cvc: data.cvc
        } as CardDetails
      };

      const response = await axios.post(`/api/sessions/${sessionId}`, { 
        paymentInstrument,
        sessionData 
      });
      
      // Store payment data for the result page, including returnUrl from session
      const paymentData = {
        ...response.data,
        returnUrl: sessionData.returnUrl
      };
      localStorage.setItem(`payment_${paymentData.paymentId}`, JSON.stringify(paymentData));
      
      // Redirect based on payment status
      switch (paymentData.status) {
        case PaymentStatus.CAPTURED:
        case PaymentStatus.AUTHORIZED:
          router.push(`/sessions/success?paymentId=${paymentData.paymentId}`);
          break;
        case PaymentStatus.REFUSED:
          router.push(`/sessions/refused?paymentId=${paymentData.paymentId}`);
          break;
        case PaymentStatus.INITIATED:
        case PaymentStatus.AUTHORIZATION_PENDING:
          router.push(`/sessions/pending?paymentId=${paymentData.paymentId}`);
          break;
        default:
          router.push(`/sessions/pending?paymentId=${paymentData.paymentId}`);
      }
    } catch (error: any) {
      // Handle payment error
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      // Handle expired session specifically
      if (error.response?.status === 410) {
        errorMessage = 'This payment session has expired. Please start a new payment session.';
        // Optionally redirect to an expired session page
        setTimeout(() => {
          router.push('/sessions/expired');
        }, 3000);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          {...register('cardNumber')}
          value={cardNumberValue || ''}
          onChange={handleCardNumberChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="text"
            id="expiryDate"
            {...register('expiryDate')}
            value={expiryDateValue || ''}
            onChange={handleExpiryDateChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="MM/YY"
            maxLength={5}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
            CVC
          </label>
          <input
            type="text"
            id="cvc"
            {...register('cvc')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="123"
          />
          {errors.cvc && (
            <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
          )}
        </div>
      </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
} 