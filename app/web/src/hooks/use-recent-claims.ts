/**
 * Hook to fetch recent claims (mock for now)
 */

import { useEffect, useState } from 'react';
import type { Claim, ClaimType } from '@/types/claim-types';

export function useRecentClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // MOCK: Replace with real source (indexer/backend) if available
    const timer = setTimeout(() => {
      const now = Date.now();
      const mock: Claim[] = [
        {
          id: 1,
          issuer: 'GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQPECS2K4DMT',
          receiver: 'GDQERENWDSIU6VU35EVI2R4PGBIOJ2CIOPKFEAAOS3M4X7XXM6MT36CK',
          claimType: 'HackathonWin' as ClaimType,
          proofHash: '0x' + 'a'.repeat(64),
          approved: true,
          timestamp: now - 1000 * 60 * 60 * 2,
        },
        {
          id: 2,
          issuer: 'GDRXE2BQUC3RUUCXXFQ2Z7WPOOLQBZXN5VBMWZ4CI2REH7I54UWHSU2K',
          receiver: 'GDTYH4I4PRCXNZW5KQXKGKPN3YVFH5RZJYVX3X5RZJYVX3X5RZJYVX3X',
          claimType: 'RepoContribution' as ClaimType,
          proofHash: '0x' + 'b'.repeat(64),
          approved: false,
          timestamp: now - 1000 * 60 * 60 * 5,
        },
        {
          id: 3,
          issuer: 'GDUK2UGVUKZ2UGVUKZ2UGVUKZ2UGVUKZ2UGVUKZ2UGVUKZ2UGVUKZ2UG',
          receiver: 'GB6NVEN5HSUBKMYCE5ZOWSK5K23TBWRUQLZY3KNMXUZ3AQPECS2K4DMT',
          claimType: 'JobCompleted' as ClaimType,
          proofHash: '0x' + 'c'.repeat(64),
          approved: true,
          timestamp: now - 1000 * 60 * 60 * 12,
        },
      ];
      setClaims(mock);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { claims, isLoading, error };
}


