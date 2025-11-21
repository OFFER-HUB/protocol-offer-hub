/**
 * Hook to fetch recent claims (mock for now)
 */

import { useEffect, useState } from 'react';
import type { Claim, ClaimType } from '@/types/claim-types';

export function useRecentClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // MOCK: Replace with real source (indexer/backend) if available
    const timer = setTimeout(() => {
      const now = Date.now();
      const mock: Claim[] = [
        {
          id: 1,
          issuer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          receiver: '5FHneW46xGXgs5mUiveU4sbTyGBzmstVj7hNwR4P3L3rZqYk',
          claimType: 'HackathonWin' as ClaimType,
          proofHash: '0x' + 'a'.repeat(64),
          approved: true,
          timestamp: now - 1000 * 60 * 60 * 2,
        },
        {
          id: 2,
          issuer: '5DAAnrj7VHTz5hU9m6uQpZgUzZ4J2G8gT1o6RkqP2cVsgv4M',
          receiver: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
          claimType: 'RepoContribution' as ClaimType,
          proofHash: '0x' + 'b'.repeat(64),
          approved: false,
          timestamp: now - 1000 * 60 * 60 * 5,
        },
        {
          id: 3,
          issuer: '5FLSigC9H8N9SxwgyYJ6F1i7CwYk8GJtYk1A1q1o1o1o1o1',
          receiver: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          claimType: 'JobCompleted' as ClaimType,
          proofHash: '0x' + 'c'.repeat(64),
          approved: true,
          timestamp: now - 1000 * 60 * 60 * 12,
        },
      ];
      setClaims(mock);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { claims, isLoading, error };
}


