/**
 * Hook to fetch current user's profile from contract
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import type { Profile } from '@/types/contract-types';

interface UseUserProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasProfile: boolean;
}

export function useUserProfile(): UseUserProfileReturn {
  const { getProfile, isReady } = useOfferHubContract();
  const { publicKey } = useWallet();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!publicKey || !isReady) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProfile(publicKey);
      setProfile(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, isReady, getProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if profile exists and has valid data (not just empty object)
  const hasValidProfile = profile !== null && 
    profile.display_name !== '' && 
    profile.display_name !== undefined &&
    profile.owner !== '';

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    hasProfile: hasValidProfile,
  };
}

