/**
 * Component to protect routes that require a profile
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProfileGuard } from '@/hooks/use-profile-guard';
import { useWallet } from '@/context/WalletContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProfileGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export function ProfileGuard({ children, redirectPath = '/profile/create' }: ProfileGuardProps) {
  const router = useRouter();
  const { isConnected } = useWallet();
  const { isChecking, hasProfile, shouldRedirect } = useProfileGuard(redirectPath);

  // Don't guard if not connected (let wallet connection handle it)
  if (!isConnected) {
    return <>{children}</>;
  }

  // Show loading while checking - this is important to prevent premature redirects
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking profile...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show loading
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to create profile...</p>
        </div>
      </div>
    );
  }

  // If no profile after checking is complete, don't render children (redirect will happen)
  // But only if we're not already on the redirect path
  if (!hasProfile && router.pathname !== redirectPath) {
    return null; // Will trigger redirect in useProfileGuard
  }

  return <>{children}</>;
}

