'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useQueryClientCheck() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!queryClient) {
      console.error('QueryClient not found! Make sure components are wrapped in QueryClientProvider');
    } else {
      console.log('QueryClient is available');
    }
  }, [queryClient]);
  
  return queryClient;
}
