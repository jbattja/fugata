import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { Action, RedirectMethod, SharedLogger } from '@fugata/shared';

interface RedirectPageProps {
  paymentId: string;
  encryptedAction?: string;
  error?: string;
}

export default function RedirectPage({ paymentId, encryptedAction, error }: RedirectPageProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(error || null);

  useEffect(() => {
    if (error) {
      return;
    }

    const processRedirect = async () => {
      try {
        let action: Action;

        if (encryptedAction) {
          // POST request - decrypt the provided action via API
          const response = await fetch(`/api/redirect/decrypt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encryptedAction }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            setRedirectError(errorData.error || 'Failed to decrypt redirect action');
            return;
          }

          const { action: redirectAction } = await response.json();
          action = redirectAction;
        } else {
          // GET request - fetch payment redirect action via API
          const response = await fetch(`/api/redirect/${paymentId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            setRedirectError(errorData.error || 'Failed to fetch redirect action');
            return;
          }

          const { action: redirectAction } = await response.json();
          action = redirectAction;
        }
        
        if (action.actionType !== 'REDIRECT' || !action.redirectUrl) {
          setRedirectError('Invalid redirect action');
          return;
        }

        setIsRedirecting(true);

        // Log the redirect for troubleshooting
        SharedLogger.log('Redirecting to:' + action.redirectUrl + ', Method:' + action.redirectMethod, RedirectPage.name);

        // Perform the redirect based on the method
        if (action.redirectMethod === RedirectMethod.POST && action.data) {
          // Create a form for POST redirect
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = action.redirectUrl;
          form.style.display = 'none';

          // Add form data
          Object.entries(action.data).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          // GET redirect
          window.location.href = action.redirectUrl;
        }
      } catch (err) {
        console.error('Failed to process redirect:', err);
        setRedirectError('Failed to process redirect');
      }
    };

    processRedirect();
  }, [paymentId, encryptedAction, error]);

  if (redirectError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Redirect Error
          </h2>
          <p className="text-gray-600 text-center">
            {redirectError}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600 text-center">
            Please wait while we redirect you to complete your payment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Processing...
        </h2>
        <p className="text-gray-600 text-center">
          Preparing your redirect...
        </p>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDataBlob } = context.params as { redirectDataBlob: string };

  if (!redirectDataBlob) {
    return {
      props: {
        paymentId: '',
        error: 'No payment ID provided'
      }
    };
  }

  // Check if this is a POST request with encrypted action data
  if (context.req.method === 'POST') {
    try {
      // Parse the POST body to get the encrypted action
      const body = await new Promise<string>((resolve, reject) => {
        let data = '';
        context.req.on('data', chunk => data += chunk);
        context.req.on('end', () => resolve(data));
        context.req.on('error', reject);
      });

      // Check if the content type is JSON or form data
      const contentType = context.req.headers['content-type'] || '';
      
      let encryptedAction: string;
      
      if (contentType.includes('application/json')) {
        // JSON data
        const parsedBody = JSON.parse(body);
        encryptedAction = parsedBody.encryptedAction;
      } else {
        // Form data - parse URL-encoded form data
        const formData = new URLSearchParams(body);
        encryptedAction = formData.get('encryptedAction') || '';
      }

      if (!encryptedAction) {
        return {
          props: {
            paymentId: redirectDataBlob,
            error: 'No encrypted action provided'
          }
        };
      }

      // Just pass the encrypted action to the client-side for decryption
      
      return {
        props: {
          paymentId: redirectDataBlob,
          encryptedAction
        }
      };
    } catch (error) {
      return {
        props: {
          paymentId: redirectDataBlob,
          error: 'Invalid encrypted action data'
        }
      };
    }
  }

  // GET request - just return the payment ID for client-side payment lookup
  return {
    props: {
      paymentId: redirectDataBlob
    }
  };
};
