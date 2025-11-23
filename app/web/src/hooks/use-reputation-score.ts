/**
 * Hook to fetch and cache reputation score for an account
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';

interface UseReputationScoreReturn {
  score: number | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReputationScore(account: string | null): UseReputationScoreReturn {
  const { getReputationScore, isReady } = useOfferHubContract();
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!account || !isReady) {
      setScore(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getReputationScore(account);
      setScore(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch reputation score');
      setScore(null);
    } finally {
      setIsLoading(false);
    }
  }, [account, isReady, getReputationScore]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    isLoading,
    error,
    refresh: fetchScore,
  };
}

