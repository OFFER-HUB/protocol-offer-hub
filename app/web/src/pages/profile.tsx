/**
 * Profile page - View and edit user profile
 */

import { useState } from 'react';
import Head from 'next/head';
import { useWallet } from '@/context/WalletContext';
import { ProfileGuard } from '@/components/profile-guard';
import { OfferHubProfileCard } from '@/components/my-profile/offer-hub-profile-card';
import { ProfileEditForm } from '@/components/my-profile/profile-edit-form';
import { useUserProfile } from '@/hooks/use-user-profile';

export default function ProfilePage() {
  const { isConnected } = useWallet();
  const { hasProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClick = () => {
    setActiveTab('edit');
  };

  const handleEditSuccess = () => {
    // Refresh profile data by updating key
    setRefreshKey(prev => prev + 1);
    // Switch back to view after a short delay
    setTimeout(() => {
      setActiveTab('view');
    }, 1500);
  };

  return (
    <ProfileGuard>
      <>
        <Head>
          <title>My Profile - Protocol Offer Hub</title>
          <meta name="description" content="View and edit your profile" />
        </Head>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-6 md:mb-8 animate-fade-in">
                <div className="inline-block px-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    <span className="text-gray-900">My </span>
                    <span className="text-primary-600">Profile</span>
                  </h1>
                  <div className="h-1 w-20 md:w-24 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto mt-3 md:mt-4 rounded-full"></div>
                </div>
                <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto mt-4 md:mt-5 px-4">
                  Manage your profile information and build your on-chain reputation
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
                    <p className="text-yellow-800 text-sm">Connect your wallet to view and edit your profile.</p>
                  </div>
                </div>
              ) : !hasProfile ? (
                <div className="max-w-xl mx-auto animate-slide-up">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 md:p-8 text-center shadow-lg">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">No Profile Found</h3>
                    <p className="text-blue-800 text-sm mb-4">You need to register a profile first.</p>
                    <a
                      href="/profile/create"
                      className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Profile
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {/* Tabs */}
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                    <button
                      onClick={() => setActiveTab('view')}
                      className={`flex-1 px-4 py-3 rounded-md font-semibold transition-all ${
                        activeTab === 'view'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      👤 View Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('edit')}
                      className={`flex-1 px-4 py-3 rounded-md font-semibold transition-all ${
                        activeTab === 'edit'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div key={refreshKey}>
                    {activeTab === 'view' ? (
                      <div className="animate-slide-right">
                        <OfferHubProfileCard onEditClick={handleEditClick} />
                      </div>
                    ) : (
                      <div className="animate-slide-left">
                        <ProfileEditForm onSuccess={handleEditSuccess} />
                      </div>
                    )}
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
