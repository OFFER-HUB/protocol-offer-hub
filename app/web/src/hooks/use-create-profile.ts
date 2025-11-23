/**
 * Hook to create user profile
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useOfferHubContract } from './use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from './use-user-profile';
import type { LinkedAccount } from '@/types/contract-types';

interface CreateProfileParams {
  displayName: string;
  metadataUri: string;
  countryCode?: string;
  email?: string;
  linkedAccounts: LinkedAccount[];
}

interface UseCreateProfileReturn {
  createProfile: (params: CreateProfileParams) => Promise<void>;
  isCreating: boolean;
  error: string | null;
  success: boolean;
}

export function useCreateProfile(): UseCreateProfileReturn {
  const router = useRouter();
  const { registerProfile } = useOfferHubContract();
  const { publicKey } = useWallet();
  const { refresh: refreshProfile } = useUserProfile();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createProfile = async (params: CreateProfileParams) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!params.displayName.trim()) {
      throw new Error('Display name is required');
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Convert email to hash if provided
      let emailHashBytes: Uint8Array | undefined;
      if (params.email?.trim()) {
        const encoder = new TextEncoder();
        const data = encoder.encode(params.email.trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        emailHashBytes = new Uint8Array(hashBuffer);
      }

      await registerProfile({
        metadata_uri: params.metadataUri || 'ipfs://placeholder',
        display_name: params.displayName,
        country_code: params.countryCode || undefined,
        linked_accounts: params.linkedAccounts,
        email_hash: emailHashBytes,
      });

      setSuccess(true);
      
      // Refresh profile data to update the state
      await refreshProfile();
      
      // Redirect to home after successful creation
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (e: any) {
      const errorMessage = e.message || e.toString() || 'Failed to create profile';
      setError(errorMessage);
      throw e;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createProfile,
    isCreating,
    error,
    success,
  };
}

