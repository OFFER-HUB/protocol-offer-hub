/**
 * Hook to fetch profile from contract for explore page
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import type { Profile } from '@/types/contract-types';

interface ExploreProfileState {
  isLoading: boolean;
  error: string | null;
  profile: Profile | null;
}

export function useExploreProfile(address: string | null): ExploreProfileState {
  const { getProfile, isReady } = useOfferHubContract();
  const [state, setState] = useState<ExploreProfileState>({
    isLoading: false,
    error: null,
    profile: null,
  });

  useEffect(() => {
    if (!address || !isReady) {
      setState({ isLoading: false, error: null, profile: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const fetchProfile = async () => {
      try {
        const profile = await getProfile(address);
        setState({ isLoading: false, error: null, profile });
      } catch (err: any) {
        setState({ 
          isLoading: false, 
          error: err?.message || 'Failed to load profile', 
          profile: null 
        });
      }
    };

    fetchProfile();
  }, [address, isReady, getProfile]);

  return state;
}

