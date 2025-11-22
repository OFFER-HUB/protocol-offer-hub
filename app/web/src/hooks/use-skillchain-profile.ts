/**
 * Hook: use-skillchain-profile
 * - Adapter minimal para invocar el contrato Offer Hub desde el UI
 * - Expone métodos esperados para manejar DIDs y perfiles
 */

import { useCallback, useMemo } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';

interface LinkResult {
  success: boolean;
  error?: string;
}

export function useSkillchainProfile() {
  const { isReady, error: contractError, linkDid: contractLinkDid, getDid: contractGetDid, registerProfile: contractRegisterProfile } = useOfferHubContract();
  const { publicKey } = useWallet();

  const linkDid = useCallback(
    async (did: string): Promise<LinkResult> => {
      try {
        if (!isReady) {
          return { success: false, error: 'Contract not ready' };
        }
        if (!publicKey) {
          return { success: false, error: 'No signer address' };
        }

        await contractLinkDid(did);
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || 'linkDid tx failed' };
      }
    },
    [isReady, publicKey, contractLinkDid]
  );

  const getDid = useCallback(
    async (accountId: string): Promise<string | null> => {
      try {
        if (!isReady) return null;
        return await contractGetDid(accountId);
      } catch {
        return null;
      }
    },
    [isReady, contractGetDid]
  );

  // Wrapper for register profile if needed in same context
  const registerProfile = useCallback(
    async (metadataUri: string): Promise<LinkResult> => {
      try {
        if (!isReady) {
           return { success: false, error: 'Contract not ready' };
        }
        await contractRegisterProfile({ metadata_uri: metadataUri });
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e?.message || 'registerProfile tx failed' };
      }
    },
    [isReady, contractRegisterProfile]
  );

  return useMemo(
    () => ({
      isReady,
      contractError,
      linkDid,
      getDid,
      registerProfile
    }),
    [contractError, getDid, isReady, linkDid, registerProfile]
  );
}
