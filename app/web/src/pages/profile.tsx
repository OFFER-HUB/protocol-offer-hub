import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { useKiltProfile } from '@/hooks/use-kilt-profile';
import { ProfileCard } from '@/components/my-profile/profile-card';
import { ProfileSetup } from '@/components/my-profile/profile-setup';
import { LinkedDidCard } from '@/components/my-profile/linked-did-card';
import { CredentialVerifier } from '@/components/my-profile/credential-verifier';
import { OfferHubProfileCard } from '@/components/my-profile/offer-hub-profile-card';
import { ProfileEditForm } from '@/components/my-profile/profile-edit-form';
import { ReputationDisplay } from '@/components/my-profile/reputation-display';
import { ReceivedClaimsList } from '@/components/my-profile/received-claims-list';
import { ErrorAlert } from '@/components/ErrorAlert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useOfferHubProfile } from '@/hooks/use-skillchain-profile';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function ProfilePage() {
  const { isConnected: walletConnected, connect: connectWallet, publicKey } = useWallet();
  const { state, connect, createLightDid, resolveCurrentDid, linkDidToProfile, getDidFromAccount, verifyCredential } = useKiltProfile();
  const offerHub = useOfferHubProfile();
  const [isRefreshingLinked, setIsRefreshingLinked] = React.useState(false);
  const [linkedDid, setLinkedDid] = React.useState<string | null>(null);
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Auto-connect KILT network when entering the page to match test expectations
    connect();
  }, [connect]);

  const handleProfileUpdate = () => {
    // Trigger refresh of profile data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Head>
        <title>My Profile - Protocol Offer Hub</title>
        <meta name="description" content="Manage your profile and view your reputation" />
      </Head>
      <div className="container mx-auto px-4 py-10 space-y-8">
        {!walletConnected && (
          <div className="max-w-2xl mx-auto">
            <ErrorAlert message="Connect your Stellar wallet to continue." />
            <div className="mt-4">
              <button
                className="inline-flex items-center px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}

        {walletConnected && (
          <>
            {/* Header Section */}
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-gray-600 mt-2">Manage your on-chain identity and reputation</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/my-claims">
                    <Button variant="outline">View All Claims</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Offer Hub Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="lg:col-span-2">
                <OfferHubProfileCard />
              </div>
              <div>
                <ReputationDisplay account={publicKey} size="md" />
              </div>
            </div>

            {/* Edit Profile Section */}
            <div className="max-w-5xl mx-auto">
              <ProfileEditForm onSuccess={handleProfileUpdate} />
            </div>

            {/* KILT Identity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <ProfileCard did={state.identity.did} />

              <ProfileSetup
                hasDid={!!state.identity.did}
                isConnecting={state.isConnecting}
                isResolving={state.isResolving}
                connectError={state.connectError}
                actionError={state.actionError}
                resolveError={state.resolveError}
                resolvedUri={state.lastResolvedUri || null}
                onCreateDid={() => createLightDid()}
                onResolve={resolveCurrentDid}
              />
            </div>

            {/* Linked DID Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <LinkedDidCard
                onChainDid={linkedDid}
                isReady={offerHub.isReady}
                error={offerHub.contractError || null}
                isRefreshing={isRefreshingLinked}
                onRefresh={async () => {
                  if (!publicKey) return;
                  setIsRefreshingLinked(true);
                  try {
                    const did = await getDidFromAccount(publicKey, { linkDid: offerHub.linkDid, getDid: offerHub.getDid });
                    setLinkedDid(did);
                  } finally {
                    setIsRefreshingLinked(false);
                  }
                }}
                onLink={
                  state.identity.did
                    ? async () => {
                        setLinkError(null);
                        try {
                          await linkDidToProfile({ linkDid: offerHub.linkDid, getDid: offerHub.getDid }, publicKey || undefined);
                          // refresh after link
                          if (publicKey) {
                            const did = await getDidFromAccount(publicKey, { linkDid: offerHub.linkDid, getDid: offerHub.getDid });
                            setLinkedDid(did);
                          }
                        } catch (e: any) {
                          setLinkError(e?.message || 'Failed to link DID');
                        }
                      }
                    : undefined
                }
                canLink={!!state.identity.did && !!walletConnected}
              />
              {linkError && <ErrorAlert message={linkError} />}
            </div>

            {/* Recent Claims Section */}
            <div className="max-w-5xl mx-auto">
              <ReceivedClaimsList account={publicKey} showTitle={true} maxItems={5} />
            </div>

            {/* Credential Verifier Section */}
            <div className="max-w-5xl mx-auto">
              <CredentialVerifier
                onVerify={async (json) => {
                  try {
                    const parsed = JSON.parse(json);
                    return await verifyCredential(parsed);
                  } catch (e: any) {
                    return { valid: false, revoked: false, error: e?.message || 'Invalid JSON' };
                  }
                }}
              />
            </div>

            {/* Status Section */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>KILT Network: {state.isConnected ? 'Connected' : 'Disconnected'}</div>
                  <div>
                    Account: {publicKey ? publicKey : '—'}
                  </div>
                </div>
                {(state.isConnecting || state.isResolving) && (
                  <div className="mt-4">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}


