/**
 * Profile creation page - modern interface for creating user profile
 */

import Head from 'next/head';
import { ProfileCreateForm } from '@/components/profile-create/profile-create-form';
import { useWallet } from '@/context/WalletContext';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';

export default function ProfileCreatePage() {
  const { isConnected, publicKey } = useWallet();
  const router = useRouter();
  const { hasProfile, isLoading, error, profile } = useUserProfile();
  const { isReady } = useOfferHubContract();
  const hasRedirectedRef = useRef(false);

  // Only redirect if we're absolutely sure the user has a valid profile
  // Wait for both contract and profile to be ready, and verify profile has data
  useEffect(() => {
    // Don't redirect while loading or if contract isn't ready
    if (isLoading || !isReady || !isConnected || !publicKey) {
      return;
    }

    // Only redirect if profile exists AND has valid data (not just null check)
    // Also check that we haven't already redirected
    if (hasProfile && profile && profile.display_name && !hasRedirectedRef.current) {
      // Add a delay to prevent immediate redirects that might be false positives
      const timer = setTimeout(() => {
        if (hasProfile && profile && profile.display_name) {
          hasRedirectedRef.current = true;
          router.replace('/');
        }
      }, 3000); // Wait 3 seconds to ensure it's a real profile

      return () => clearTimeout(timer);
    }
  }, [hasProfile, profile, isLoading, isReady, isConnected, publicKey, router]);

  // Redirect if not connected (only if we're sure it's disconnected)
  useEffect(() => {
    if (!isLoading && !isConnected) {
      router.replace('/');
    }
  }, [isConnected, isLoading, router]);

  // Show loading while checking profile or contract
  if (!isConnected || isLoading || !isReady) {
    return (
      <>
        <Head>
          <title>Create Profile - Protocol Offer Hub</title>
          <meta name="description" content="Create your on-chain professional profile" />
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
            {error && (
              <p className="text-red-600 text-sm mt-2">Error: {error}</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Create Profile - Protocol Offer Hub</title>
        <meta name="description" content="Create your on-chain professional profile" />
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                  Create Your Profile
                </h1>
                <p className="text-lg text-gray-600">
                  Build your on-chain professional identity
                </p>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <ProfileCreateForm />
              </div>

              {/* Info Section */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your profile will be stored on-chain on Stellar. 
                  Make sure all information is accurate as it will be publicly verifiable.
                </p>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}

