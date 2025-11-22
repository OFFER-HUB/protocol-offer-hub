/**
 * Explore page - search and view profiles with reputation scores
 */

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AddressSearch } from '@/components/explore/address-search';
import { useExploreProfile } from '@/hooks/use-explore-profile';
import { ProfileSummaryReal } from '@/components/explore/profile-summary-real';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function Explore() {
  const router = useRouter();
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const { isLoading, error, profile } = useExploreProfile(searchAddress);

  useEffect(() => {
    const a = (router.query.address as string) || null;
    if (a && a !== searchAddress) setSearchAddress(a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.address]);

  const handleSearch = (address: string) => {
    setSearchAddress(address);
    router.replace({ pathname: '/explore', query: { address } }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>Explore - Protocol Offer Hub</title>
        <meta name="description" content="Search and explore Protocol Offer Hub profiles and claims" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                Explore Profiles
              </h1>
              <p className="text-gray-600 mt-3">
                Search for profiles by Stellar address and view their reputation
              </p>
            </div>

            {/* Search form */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <AddressSearch
                  onSearch={handleSearch}
                  loading={isLoading}
                  initialAddress={searchAddress || ''}
                />
              </div>
            </div>

            {/* Empty state */}
            {!searchAddress && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">
                  Enter a Stellar address above to search for profiles and claims.
                </p>
              </div>
            )}

            {/* Search results */}
            {searchAddress && (
              <div className="w-full">
                {isLoading && (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">Loading profile...</p>
                  </div>
                )}
                {!isLoading && error && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <ErrorAlert message={error} />
                  </div>
                )}
                {!isLoading && !profile && !error && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 mb-2">No profile found for this address.</p>
                    <p className="text-sm text-gray-500">
                      The address may not have registered a profile yet.
                    </p>
                  </div>
                )}
                {!isLoading && profile && searchAddress && (
                  <ProfileSummaryReal profile={profile} address={searchAddress} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}


