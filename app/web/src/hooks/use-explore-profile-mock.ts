/**
 * Hook: use-explore-profile-mock
 * - Returns mock profile data for a given Polkadot address
 * - No external requests; purely simulated for Explore flow demo
 */

import { useEffect, useMemo, useState } from 'react';
import type { ExploreProfileState, ProfileSummary } from '@/types/profile-types';

// Small deterministic mock generator based on address content
function generateMockProfile(address: string): ProfileSummary {
  const seed = address.slice(0, 6);
  const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Ferdie'];
  const idx = Array.from(seed).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % names.length;
  const displayName = `${names[idx]} Builder`;
  const totalClaims = 3 + (idx % 4);
  const approvedClaims = Math.max(0, totalClaims - (idx % 2));
  return {
    address,
    displayName,
    avatarUrl: `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(address)}`,
    bio: 'Web3 developer focused on Polkadot ecosystem and on-chain reputation.',
    totalClaims,
    approvedClaims,
  };
}

export function useExploreProfileMock(address: string | null): ExploreProfileState {
  const [state, setState] = useState<ExploreProfileState>({
    isLoading: false,
    error: null,
    profile: null,
  });

  const normalized = useMemo(
    () => (address ? address.trim() : ''),
    [address]
  );

  useEffect(() => {
    if (!normalized) {
      setState({ isLoading: false, error: null, profile: null });
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    // Simulate network latency
    const timer = setTimeout(() => {
      try {
        // Simple rule: if address contains 'zzz' then simulate not found
        if (normalized.toLowerCase().includes('zzz')) {
          setState({ isLoading: false, error: null, profile: null });
        } else {
          const profile = generateMockProfile(normalized);
          setState({ isLoading: false, error: null, profile });
        }
      } catch (e: any) {
        setState({ isLoading: false, error: e?.message || 'Failed to load profile', profile: null });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [normalized]);

  return state;
}


