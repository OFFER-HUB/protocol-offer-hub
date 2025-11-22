/**
 * Hook to submit a new claim using the Offer Hub contract.
 */

import { useCallback, useState } from 'react';
import { useOfferHubContract } from './use-offer-hub-contract';
import { hexToProofHash } from '../types/contract-types';
import type { ClaimType } from '@/types/claim-types';

export function useAddClaim() {
  const { addClaim, isReady } = useOfferHubContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submit = useCallback(
    async (receiver: string, claimType: ClaimType | string, proofHash: string) => {
      if (!isReady) {
        setError('Contract not ready');
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setTxHash(null);
      
      try {
        // Convert hex string to Uint8Array (ProofHash)
        // Assuming input proofHash is a hex string of 32 bytes
        let proofHashBytes: Uint8Array;
        try {
           // If it's a mock hash that's not valid hex, handle or assume valid hex input
           if (proofHash.startsWith('0x')) {
             proofHashBytes = hexToProofHash(proofHash.slice(2));
           } else {
             proofHashBytes = hexToProofHash(proofHash);
           }
        } catch (e) {
          // Fallback or throw. For now let's assume valid input or let hexToProofHash throw
          throw new Error('Invalid proof hash format. Expected 32-byte hex string.');
        }

        await addClaim({
          receiver,
          claim_type: claimType,
          proof_hash: proofHashBytes,
        });
        
        // In Soroban, we might want to capture the tx hash from the result if we return it
        // For now, we assume success if no error
        setTxHash('success'); 
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Submission failed');
      } finally {
        setIsSubmitting(false);
      }
    },
    [addClaim, isReady]
  );

  return { submit, isSubmitting, error, txHash };
}
