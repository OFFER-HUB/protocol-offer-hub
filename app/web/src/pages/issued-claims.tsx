/**
 * Issued Claims page - displays all claims issued by the current user
 */

import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { ProfileGuard } from '@/components/profile-guard';
import { IssuedClaimsList } from '@/components/claims/issued-claims-list';
import { ErrorAlert } from '@/components/ErrorAlert';

export default function IssuedClaimsPage() {
  const { publicKey, isConnected } = useWallet();

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>Issued Claims - Protocol Offer Hub</title>
          <meta name="description" content="View all claims you have issued" />
        </Head>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <div className="max-w-5xl mx-auto">
              {/* Header Section with Animation */}
              <div className="text-center mb-6 md:mb-8 animate-fade-in">
                <div className="inline-block px-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    <span className="text-gray-900">Issued </span>
                    <span className="text-primary-600">Claims</span>
                  </h1>
                  <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 md:mt-4 rounded-full"></div>
                </div>
                <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-4 md:mt-5 px-4">
                  View all claims you have issued to others
                </p>
              </div>

              {!isConnected ? (
                <div className="max-w-xl mx-auto animate-slide-up">
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6 md:p-8 text-center shadow-lg">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-full mb-4">
                      <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">Wallet Not Connected</h3>
                    <p className="text-yellow-800 text-sm">Connect your wallet to view your issued claims.</p>
                  </div>
                </div>
              ) : (
                <div className="animate-slide-up">
                  <IssuedClaimsList account={publicKey} showTitle={false} showDetails={true} />
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    </ProfileGuard>
  );
}

