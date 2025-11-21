/**
 * Hook to validate Stellar addresses
 */

import { useMemo } from 'react';

export function useAddressValidation(address: string) {
  return useMemo(() => {
    const value = address?.trim();
    if (!value) return false;
    
    // Stellar public keys start with 'G' and are 56 characters long
    // Basic validation - can be enhanced with StrKey.decodeEd25519PublicKey if needed
    const stellarAddressRegex = /^G[A-Z0-9]{55}$/;
    
    return stellarAddressRegex.test(value);
  }, [address]);
}


