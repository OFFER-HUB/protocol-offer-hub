/**
 * Hook to fetch claims received by an account using get_user_claims
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import type { Claim } from '@/types/contract-types';

interface UseUserClaimsReturn {
  claims: Claim[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserClaims(account: string | null): UseUserClaimsReturn {
  const { getUserClaims, isReady } = useOfferHubContract();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    if (!account || !isReady) {
      setClaims([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getUserClaims(account);
      setClaims(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch user claims');
      setClaims([]);
    } finally {
      setIsLoading(false);
    }
  }, [account, isReady, getUserClaims]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  return {
    claims,
    isLoading,
    error,
    refresh: fetchClaims,
  };
}

