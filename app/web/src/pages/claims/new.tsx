/**
 * Create Claim page - orchestrates the ClaimForm with receiver preview
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProfileGuard } from '@/components/profile-guard';
import { ClaimForm } from '@/components/claims/claim-form';
import { useEffect, useState } from 'react';

// Mock receiver address for MVP demo
const MOCK_RECEIVER_ADDRESS = 'GDVDE6ZERJ56JER6RNUNUHA22NYDUXSTOZRHSRMCWNLFEHYSD3WEKFYE';

export default function NewClaimPage() {
  const router = useRouter();
  const [receiver, setReceiver] = useState<string>(MOCK_RECEIVER_ADDRESS);
  const [claimId, setClaimId] = useState<number | null>(null);

  useEffect(() => {
    const receiverFromQuery = (router.query.receiver as string) || '';
    if (receiverFromQuery) {
      setReceiver(receiverFromQuery);
    }
  }, [router.query.receiver]);

  const handleClaimCreated = (id: number) => {
    setClaimId(id);
    // Redirect after a short delay
    setTimeout(() => {
      router.push({
        pathname: '/explore',
        query: { address: receiver },
      });
    }, 2000);
  };

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>Generate Claim - Protocol Offer Hub</title>
          <meta name="description" content="Generate a claim on Protocol Offer Hub" />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Generate Claim</h1>
                <p className="text-gray-600 mt-2">
                  Confirm work delivery and issue a verification claim.
                </p>
              </div>

              <ClaimForm 
                receiver={receiver}
                onSubmit={handleClaimCreated}
              />

              {claimId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-green-800">
                  <div className="font-semibold text-lg mb-2">✅ Claim created successfully!</div>
                  <div className="text-sm mb-2">
                    <span className="font-medium">Claim ID:</span> {claimId}
                  </div>
                  <div className="text-sm text-green-700">
                    Redirecting...
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
