/**
 * Create Claim page - orchestrates the ClaimForm with receiver preview
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProfileGuard } from '@/components/profile-guard';
import { ClaimForm } from '@/components/claims/claim-form';
import { useAddClaim } from '@/hooks/use-add-claim';
import { useEffect, useState } from 'react';

export default function NewClaimPage() {
  const router = useRouter();
  const { submit, isSubmitting, error, txHash } = useAddClaim();
  const [initialReceiver, setInitialReceiver] = useState<string>('');

  useEffect(() => {
    const receiver = (router.query.receiver as string) || '';
    if (receiver) {
      setInitialReceiver(receiver);
    }
  }, [router.query.receiver]);

  const handleSubmit = async (data: { receiver: string; claimType: any; proofHash: string }) => {
    try {
      await submit(data.receiver, data.claimType, data.proofHash);
      router.replace({ pathname: '/explore', query: { address: data.receiver } }, undefined, { shallow: true });
    } catch {
      // swallow; error is already handled by hook state
    }
  };

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>Create Claim - Protocol Offer Hub</title>
          <meta name="description" content="Create a new claim on Protocol Offer Hub" />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Create Claim</h1>
                <p className="text-gray-600 mt-2">
                  Issue a claim to verify someone's work, skill, or achievement.
                </p>
              </div>

              <ClaimForm 
                onSubmit={handleSubmit} 
                submitting={isSubmitting} 
                error={error}
                initialReceiver={initialReceiver}
              />

              {txHash && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                  <div className="font-semibold mb-1">Claim created successfully!</div>
                  <div>Transaction: <span className="font-mono">{txHash}</span></div>
                  <div className="mt-2 text-xs">
                    Redirecting to receiver's profile...
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    </ProfileGuard>
  );
}
