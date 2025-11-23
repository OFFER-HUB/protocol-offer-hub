/**
 * Explore page - view all available profiles
 * Fetches real profile data from blockchain, falls back to mock data if not found
 */

import Head from 'next/head';
import { ProfileCardWithFallback } from '@/components/explore/profile-card-with-fallback';
import { MOCK_PROFILES } from '@/data/mock-profiles';

export default function Explore() {
  return (
    <>
      <Head>
        <title>Explore - Protocol Offer Hub</title>
        <meta name="description" content="Explore Protocol Offer Hub profiles and claims" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
          <div className="max-w-6xl mx-auto">
            {/* Header Section with Animation */}
            <div className="text-center mb-8 md:mb-10 animate-fade-in">
              <div className="inline-block px-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  <span className="text-gray-900">Explore </span>
                  <span className="text-primary-600">Profiles</span>
                </h1>
                <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 md:mt-4 rounded-full"></div>
              </div>
              <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-4 md:mt-5 px-4">
                Discover profiles and view their reputation scores
              </p>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
              {MOCK_PROFILES.map((item, index) => (
                <div
                  key={item.address}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-fade-in"
                >
                  <ProfileCardWithFallback 
                    address={item.address} 
                    mockProfile={item.profile}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


