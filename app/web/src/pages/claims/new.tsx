/**
 * Create Claim page - Work delivery confirmation
 * Validates receiver from query and orchestrates ClaimForm
 */

import Head from 'next/head';
import { useRouter } from 'next/router';
import { ClaimForm } from '@/components/claims/claim-form';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import { useState } from 'react';

// Mock addresses for MVP demo
const MOCK_ISSUER_ADDRESS = 'GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE';
const MOCK_RECEIVER_ADDRESS = 'GDVDE6ZERJ56JER6RNUNUHA22NYDUXSTOZRHSRMCWNLFEHYSD3WEKFYE';

export default function NewClaimPage() {
  const router = useRouter();
  const { isReady } = useOfferHubContract();
  const { isConnected } = useWallet();
  const [claimId, setClaimId] = useState<number | null>(null);
  
  // Always use mock receiver address for MVP demo
  const receiver = MOCK_RECEIVER_ADDRESS;
  
  // Show wallet connection message if not connected
  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Generate Claim - Protocol Offer Hub</title>
          <meta name="description" content="Generate a claim on Protocol Offer Hub" />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Wallet Required</h1>
              <p className="text-gray-600 mb-6">
                Please connect your Freighter wallet to generate claims on-chain.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

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
    <>
      <Head>
        <title>Generate Claim - Protocol Offer Hub</title>
        <meta name="description" content="Generate a claim on Protocol Offer Hub" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            {!isReady && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                <p>Loading contract...</p>
              </div>
            )}

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
  );
}
