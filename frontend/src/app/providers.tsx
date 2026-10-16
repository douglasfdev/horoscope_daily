import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * QueryClientProvider component
 * Provides React Query context to the app
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // Cache for 5 minutes
          staleTime: 5 * 60 * 1000,
          // Don't retry on 404
          retry: (failureCount, error) => {
            if (error.response?.status === 404) return false;
            return failureCount < 3;
          },
          // Cache across redirects
          gcTime: 10 * 60 * 1000,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}