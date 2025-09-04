import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

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

  const handleStartNewSession = () => {
    // Redirect to a page where they can start a new session
    // This would typically be the merchant's checkout page
    if (sessionData?.returnUrl) {
      window.location.href = sessionData.returnUrl;
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Session Expired
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This payment session has expired and is no longer valid.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Payment Session Expired
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      The payment session you were using has expired.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              {sessionData?.returnUrl && (
                <button
                  onClick={handleReturnToMerchant}
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

            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact the merchant directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
