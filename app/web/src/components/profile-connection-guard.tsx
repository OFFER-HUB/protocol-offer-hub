/**
 * Component that checks profile after wallet connection and redirects if needed
 * This should be placed in _app.tsx to monitor wallet connections globally
 * Only redirects from home page when wallet connects without profile
 */

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/context/WalletContext';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { useUserProfile } from '@/hooks/use-user-profile';

export function ProfileConnectionGuard() {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const { isReady } = useOfferHubContract();
  const { hasProfile, isLoading } = useUserProfile();
  const hasCheckedRef = useRef(false);
  const lastPublicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset check flag if public key changes (different wallet connected)
    if (lastPublicKeyRef.current !== publicKey) {
      hasCheckedRef.current = false;
      lastPublicKeyRef.current = publicKey;
    }

    // Only check if wallet is connected, contract is ready, and profile check is complete
    if (!isConnected || !publicKey || !isReady || isLoading) {
      return;
    }

    // Only redirect from home page when wallet first connects without profile
    // Let ProfileGuard handle other protected routes
    // Also don't redirect if already on create page
    if (router.pathname !== '/' || router.pathname === '/profile/create') {
      return;
    }

    // Only check once per wallet connection
    if (hasCheckedRef.current) {
      return;
    }

    // If no profile and on home, redirect to create page
    // Add a small delay to ensure profile check is complete
    const checkTimer = setTimeout(() => {
      if (!hasProfile && router.pathname === '/') {
        hasCheckedRef.current = true;
        router.replace('/profile/create');
      } else {
        hasCheckedRef.current = true;
      }
    }, 1000); // Wait 1 second to ensure profile check is complete

    return () => clearTimeout(checkTimer);
  }, [isConnected, publicKey, isReady, hasProfile, isLoading, router]);

  return null; // This component doesn't render anything
}

