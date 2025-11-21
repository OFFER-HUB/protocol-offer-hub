/**
 * Pending Claims page - lists claims pending approval by the current issuer.
 * NOTE: Since the contract doesn't expose claims-by-issuer query, this page uses a mock list
 * filtered by the connected account as issuer. Replace with indexed data when available.
 */

import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { IssuerPendingList } from '@/components/claims/issuer-pending-list';
import type { Claim, ClaimType } from '@/types/claim-types';
import { useEffect, useState } from 'react';

export default function PendingClaimsPage() {
  const { selectedAccount, isConnected } = (require('@/context/WalletContext') as any).useWallet?.() || {};
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    // MOCK: Replace with real data source (indexer or backend) listing claims issued by current user
    if (!selectedAccount?.address) {
      setClaims([]);
      return;
    }
    const mock: Claim[] = [
      {
        id: 101,
        issuer: selectedAccount.address,
        receiver: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        claimType: 'JobCompleted' as ClaimType,
        proofHash: '0x' + '1'.repeat(64),
        approved: false,
        timestamp: Date.now() - 1000 * 60 * 60,
      },
      {
        id: 102,
        issuer: selectedAccount.address,
        receiver: '5FHneW46xGXgs5mUiveU4sbTyGBzmstVj7hNwR4P3L3rZqYk',
        claimType: 'RepoContribution' as ClaimType,
        proofHash: '0x' + '2'.repeat(64),
        approved: false,
        timestamp: Date.now() - 1000 * 60 * 120,
      },
    ];
    setClaims(mock);
  }, [selectedAccount?.address]);

  return (
    <>
      <Head>
        <title>Pending Claims - Protocol Offer Hub</title>
        <meta name="description" content="Approve pending claims you have issued" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Pending Claims</h1>
              <p className="text-gray-600 mt-2">Approve claims you have issued.</p>
            </div>

            {!isConnected ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
                Connect your wallet to view and approve your pending claims.
              </div>
            ) : (
              <IssuerPendingList
                claims={claims}
                onApproved={(id) => {
                  setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, approved: true } : c)));
                }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}


