/**
 * Hook to update profile data using update_profile_data contract function
 */

import { useState, useCallback } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import type { UpdateProfileParams, LinkedAccount } from '@/types/contract-types';

interface UseUpdateProfileReturn {
  updateProfile: (params: Omit<UpdateProfileParams, 'owner'>) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
  success: boolean;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const { updateProfileData, isReady } = useOfferHubContract();
  const { publicKey } = useWallet();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateProfile = useCallback(
    async (params: Omit<UpdateProfileParams, 'owner'>) => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        throw new Error('Contract not ready');
      }

      setIsUpdating(true);
      setError(null);
      setSuccess(false);

      try {
        await updateProfileData(params);
        setSuccess(true);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to update profile';
        setError(errorMessage);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [publicKey, isReady, updateProfileData]
  );

  return {
    updateProfile,
    isUpdating,
    error,
    success,
  };
}

