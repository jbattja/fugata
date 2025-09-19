import React from 'react';

interface PaymentStatusCardProps {
  status: 'success' | 'refused' | 'pending' | 'error' | 'not-found';
  title: string;
  message: string;
  paymentId?: string;
  amount?: {
    value: number;
    currency: string;
  };
  refusalReason?: string;
  returnUrl?: string;
  onTryAgain?: () => void;
  onReturnHome?: () => void;
  onClose?: () => void;
}

export default function PaymentStatusCard({
  status,
  title,
  message,
  paymentId,
  amount,
  refusalReason,
  returnUrl,
  onTryAgain,
  onReturnHome,
  onClose
}: PaymentStatusCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'refused':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg className="h-6 w-6 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        );
      case 'not-found':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow p-8 text-center">
          {getStatusIcon()}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {refusalReason && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {refusalReason}
              </p>
            </div>
          )}
          
          {(paymentId || amount) && (
            <div className="text-sm text-gray-500 space-y-1">
              {paymentId && <p>Payment ID: {paymentId}</p>}
              {amount && <p>Amount: {amount.value ? (amount.value / 100).toFixed(2) : 'N/A'} {amount.currency}</p>}
            </div>
          )}
        </div>
        
        <div className="text-center space-y-2">
          {status === 'success' && returnUrl && (
            <button
              onClick={() => window.location.href = returnUrl}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
            >
              Return to Merchant
            </button>
          )}
          
          {status === 'refused' && onTryAgain && (
            <button
              onClick={onTryAgain}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
            >
              Try Again
            </button>
          )}
          
          {status === 'refused' && returnUrl && (
            <button
              onClick={() => window.location.href = returnUrl}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
            >
              Return to Merchant
            </button>
          )}
          
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-medium"
            >
              Return Home
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Close this window
            </button>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center mt-8 select-none">Powered by Fugata</div>
    </div>
  );
}
