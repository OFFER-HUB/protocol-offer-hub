/**
 * Hook to get total number of claims
 */

import { useState, useEffect } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';

export function useTotalClaims() {
  const { getTotalClaims, isReady } = useOfferHubContract();
  const [totalClaims, setTotalClaims] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalClaims = async () => {
    if (!isReady) return;

    setIsLoading(true);
    setError(null);

    try {
      const total = await getTotalClaims();
      setTotalClaims(total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch total claims';
      setError(errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching total claims:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchTotalClaims();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return {
    totalClaims,
    isLoading,
    error,
    refetch: fetchTotalClaims,
  };
}
