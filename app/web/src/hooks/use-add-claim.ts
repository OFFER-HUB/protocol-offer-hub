/**
 * Frontend-only mock hook to submit a new claim.
 * This does NOT hit the blockchain; it only simulates a submission.
 */

import { useCallback, useState } from 'react';
import type { ClaimType } from '@/types/claim-types';

export function useAddClaim() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submit = useCallback(
    async (receiver: string, claimType: ClaimType | string, proofHash: string) => {
      setIsSubmitting(true);
      setError(null);
      setTxHash(null);
      try {
        // Simulate latency
        await new Promise((r) => setTimeout(r, 800));
        // Produce a deterministic mock "tx hash"
        setTxHash('0x' + Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64));
      } catch (e: any) {
        setError(e?.message || 'Submission failed');
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { submit, isSubmitting, error, txHash };
}


