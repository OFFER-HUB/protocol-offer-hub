/**
 * Hook to approve a claim (approve_claim)
 */

import { useCallback, useState } from 'react';
import { useContract } from './useContract';
import { useWallet } from '../context/WalletContext';

export function useApproveClaim() {
  const { contract, isReady } = useContract();
  const { publicKey } = useWallet();
  
  // TODO: Implementar getSigner para Stellar
  const getSigner = async () => null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const approve = useCallback(
    async (claimId: number) => {
      if (!contract || !isReady) throw new Error('Contract not ready');
      if (!publicKey) throw new Error('No wallet account selected');

      setIsSubmitting(true);
      setError(null);
      setTxHash(null);
      try {
        const signer = await getSigner();

        const queryRes = await contract.query.approveClaim(
          publicKey,
          { value: 0, gasLimit: -1 },
          claimId
        );
        const gasLimit = (queryRes as any)?.gasRequired ?? -1;

        const unsub = await contract.tx
          .approveClaim({ value: 0, gasLimit }, claimId)
          .signAndSend(publicKey, { signer }, (result) => {
            if (result.status.isInBlock) {
              setTxHash(result.status.asInBlock.toString());
            }
            if (result.status.isFinalized) {
              setIsSubmitting(false);
              unsub();
            }
          });
      } catch (e: any) {
        setIsSubmitting(false);
        setError(e?.message || 'Failed to approve claim');
        throw e;
      }
    },
    [contract, isReady, publicKey, getSigner]
  );

  return { approve, isSubmitting, error, txHash };
}


