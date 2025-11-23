/**
 * Hook to fetch claim details by ID
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import type { Claim } from '@/types/contract-types';

interface UseClaimDetailReturn {
  claim: Claim | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useClaimDetail(claimId: number | null): UseClaimDetailReturn {
  const { getClaim, isReady } = useOfferHubContract();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaim = useCallback(async () => {
    if (claimId === null || !isReady) {
      setClaim(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getClaim(claimId);
      setClaim(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch claim');
      setClaim(null);
    } finally {
      setIsLoading(false);
    }
  }, [claimId, isReady, getClaim]);

  useEffect(() => {
    fetchClaim();
  }, [fetchClaim]);

  return {
    claim,
    isLoading,
    error,
    refresh: fetchClaim,
  };
}

