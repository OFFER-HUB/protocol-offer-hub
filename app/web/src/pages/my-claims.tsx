/**
 * My Claims page - displays all claims received by the current user
 */

import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { ProfileGuard } from '@/components/profile-guard';
import { ReceivedClaimsList } from '@/components/my-profile/received-claims-list';
import { ReputationDisplay } from '@/components/my-profile/reputation-display';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function MyClaimsPage() {
  const { publicKey, isConnected } = useWallet();

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>My Claims - Protocol Offer Hub</title>
          <meta name="description" content="View all claims you have received" />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
                <p className="text-gray-600 mt-2">View all claims you have received from others.</p>
              </div>

              {!isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
                  Connect your wallet to view your received claims.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Reputation Score - Sidebar */}
                  <div className="lg:col-span-1">
                    <ReputationDisplay account={publicKey} size="md" />
                  </div>

                  {/* Claims List - Main Content */}
                  <div className="lg:col-span-2">
                    <ReceivedClaimsList account={publicKey} showTitle={true} />
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

