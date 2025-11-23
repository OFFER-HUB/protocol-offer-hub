/**
 * Issued Claims page - displays all claims issued by the current user
 */

import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { ProfileGuard } from '@/components/profile-guard';
import { IssuedClaimsList } from '@/components/claims/issued-claims-list';
import { ErrorAlert } from '@/components/ErrorAlert';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function IssuedClaimsPage() {
  const { publicKey, isConnected } = useWallet();

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>Issued Claims - Protocol Offer Hub</title>
          <meta name="description" content="View all claims you have issued" />
        </Head>
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Issued Claims</h1>
                  <p className="text-gray-600 mt-2">View all claims you have issued to others.</p>
                </div>
                <Link href="/claims/new">
                  <Button variant="primary">Create New Claim</Button>
                </Link>
              </div>

              {!isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
                  Connect your wallet to view your issued claims.
                </div>
              ) : (
                <IssuedClaimsList account={publicKey} showTitle={false} showDetails={true} />
              )}
            </div>
          </div>
        </main>
      </>
    </ProfileGuard>
  );
}

