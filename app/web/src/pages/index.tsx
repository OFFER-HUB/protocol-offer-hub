import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { useTotalClaims } from '@/hooks/useTotalClaims';
import { useRecentClaims } from '@/hooks/use-recent-claims';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useReputationScore } from '@/hooks/use-reputation-score';
import { useUserClaims } from '@/hooks/use-user-claims';
import { useIssuedClaims } from '@/hooks/use-issued-claims';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { RecentClaims } from '@/components/claims/recent-claims';
import { ReputationDisplay } from '@/components/my-profile/reputation-display';
import Link from 'next/link';

export default function Home() {
  const { isConnected, publicKey } = useWallet();
  const { isReady, error: contractError } = useOfferHubContract();
  const { totalClaims, isLoading: isLoadingClaims, error: claimsError } = useTotalClaims();
  const { claims: recentClaims, isLoading: isLoadingRecent } = useRecentClaims();
  const { hasProfile, profile } = useUserProfile();
  const { score: reputationScore } = useReputationScore(publicKey);
  const { claims: userClaims } = useUserClaims(publicKey);
  const { claims: issuedClaims } = useIssuedClaims(publicKey);

  const receivedClaimsCount = userClaims.length;
  const issuedClaimsCount = issuedClaims.length;

  return (
    <>
      <Head>
        <title>Home - Protocol Offer Hub</title>
        <meta name="description" content="On-chain professional reputation protocol" />
      </Head>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            OFFER-HUB <span className="text-primary-600">PROTOCOL</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            On-Chain Professional Reputation Protocol
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Build your verifiable professional reputation on Stellar.
            Register achievements, receive endorsements, and showcase your
            validated skills to the world.
          </p>
        </div>

        {/* User Dashboard (if connected) */}
        {isConnected && hasProfile && (
          <div className="mb-16 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Reputation Score Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Your Reputation</h3>
                <ReputationDisplay account={publicKey} size="md" showLabel={false} />
              </div>

              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Claims Received</h3>
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {receivedClaimsCount}
                </div>
                <Link href="/my-claims" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Claims Issued</h3>
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {issuedClaimsCount}
                </div>
                <Link href="/issued-claims" className="text-sm text-primary-600 hover:text-primary-700">
                  View all →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isConnected && (
          <div className="mb-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasProfile ? (
                <>
                  <Link href="/profile">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">My Profile</h3>
                      <p className="text-sm text-gray-600">View and edit your profile</p>
                    </div>
                  </Link>
                  <Link href="/my-claims">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">My Claims</h3>
                      <p className="text-sm text-gray-600">View received claims</p>
                    </div>
                  </Link>
                  <Link href="/claims/new">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">Issue Claim</h3>
                      <p className="text-sm text-gray-600">Create a new claim</p>
                    </div>
                  </Link>
                  <Link href="/explore">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">Explore</h3>
                      <p className="text-sm text-gray-600">Search profiles</p>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">Register Profile</h3>
                      <p className="text-sm text-gray-600">Create your on-chain identity</p>
                    </div>
                  </Link>
                  <Link href="/explore">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">Explore</h3>
                      <p className="text-sm text-gray-600">Browse profiles</p>
                    </div>
                  </Link>
                  <Link href="/claims/new">
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2">Issue Claim</h3>
                      <p className="text-sm text-gray-600">Verify someone's work</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Platform Stats Section */}
        {isConnected && isReady && (
          <div className="mb-16">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Statistics</h2>
              
              {isLoadingClaims ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : claimsError ? (
                <ErrorAlert message={claimsError} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {totalClaims !== null ? totalClaims : '0'}
                    </div>
                    <div className="text-gray-600">Total Claims</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {isConnected ? '✓' : '—'}
                    </div>
                    <div className="text-gray-600">Wallet Connected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {isReady ? '✓' : '—'}
                    </div>
                    <div className="text-gray-600">Contract Ready</div>
                  </div>
                </div>
              )}

              {contractError && (
                <div className="mt-4">
                  <ErrorAlert message={`Contract Error: ${contractError}`} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Claims */}
        <div className="max-w-3xl mx-auto mb-16">
          <RecentClaims claims={recentClaims} loading={isLoadingRecent} />
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Decentralized</h3>
            <p className="text-gray-600">
              Your reputation lives on-chain, owned by you, verified by the
              network.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Verifiable</h3>
            <p className="text-gray-600">
              All claims are cryptographically signed and publicly auditable.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Portable</h3>
            <p className="text-gray-600">
              Take your reputation anywhere in the Web3 ecosystem.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!isConnected && (
          <div className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Connect your wallet to start building your on-chain reputation
              </p>
              <p className="text-sm text-gray-500">
                Make sure you have the Stellar wallet extension installed
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

