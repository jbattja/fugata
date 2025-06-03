import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not already on the login page and the session is not loading
    if (status === 'unauthenticated' && !router.pathname.startsWith('/auth/')) {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // If we're on an auth page, render children directly
  if (router.pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  // If we're authenticated, render children
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // Otherwise, show loading
  return <div>Loading...</div>;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      </QueryClientProvider>
    </SessionProvider>
  );
} 