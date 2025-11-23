/**
 * Hook to fetch claims issued by an account using get_issuer_claims
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import type { Claim } from '@/types/contract-types';

interface UseIssuedClaimsReturn {
  claims: Claim[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useIssuedClaims(account: string | null): UseIssuedClaimsReturn {
  const { getIssuerClaims, isReady } = useOfferHubContract();
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
      const result = await getIssuerClaims(account);
      setClaims(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch issued claims');
      setClaims([]);
    } finally {
      setIsLoading(false);
    }
  }, [account, isReady, getIssuerClaims]);

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

