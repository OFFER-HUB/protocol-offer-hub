/**
 * Hook to check if user has profile and handle redirection
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUserProfile } from './use-user-profile';
import { useWallet } from '@/context/WalletContext';
import { useOfferHubContract } from './use-offer-hub-contract';

interface UseProfileGuardReturn {
  isChecking: boolean;
  hasProfile: boolean;
  shouldRedirect: boolean;
}

export function useProfileGuard(redirectPath: string = '/profile/create'): UseProfileGuardReturn {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const { isReady } = useOfferHubContract();
  const { hasProfile, isLoading } = useUserProfile();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const hasRedirectedRef = useRef(false);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    // Reset redirect flag if path changes (user navigated)
    if (lastPathRef.current !== router.pathname) {
      // Only reset if we're not on the redirect path
      if (router.pathname !== redirectPath) {
        hasRedirectedRef.current = false;
        setShouldRedirect(false);
      }
      lastPathRef.current = router.pathname;
    }

    // Only check if wallet is connected and contract is ready
    if (!isConnected || !publicKey || !isReady) {
      hasRedirectedRef.current = false;
      setShouldRedirect(false);
      return;
    }

    // Wait for profile check to complete - this is critical
    if (isLoading) {
      setShouldRedirect(false);
      return;
    }

    // If already on redirect path, don't redirect again
    if (router.pathname === redirectPath) {
      hasRedirectedRef.current = false;
      setShouldRedirect(false);
      return;
    }

    // If user has profile, clear redirect flag
    if (hasProfile) {
      hasRedirectedRef.current = false;
      setShouldRedirect(false);
      return;
    }

    // Only redirect if we're absolutely sure there's no profile
    // Add a delay to ensure profile check is complete and avoid race conditions
    const checkTimer = setTimeout(() => {
      // Double-check conditions
      if (isLoading || !isConnected || !publicKey || !isReady) {
        return;
      }

      // If already on redirect path, don't redirect
      if (router.pathname === redirectPath) {
        hasRedirectedRef.current = false;
        setShouldRedirect(false);
        return;
      }

      // If no profile and haven't redirected yet, redirect
      if (!hasProfile && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        setShouldRedirect(true);
        router.push(redirectPath);
      }
    }, 800); // Delay to ensure profile check is complete

    return () => clearTimeout(checkTimer);
  }, [isConnected, publicKey, isReady, hasProfile, isLoading, router, redirectPath]);

  return {
    isChecking: isLoading,
    hasProfile: hasProfile || false,
    shouldRedirect,
  };
}

