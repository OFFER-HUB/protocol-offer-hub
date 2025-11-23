import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { ProfileGuard } from '@/components/profile-guard';
import Link from 'next/link';

export default function ProfilePage() {
  const { isConnected } = useWallet();

  return (
    <ProfileGuard>
      <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            
            {!isConnected ? (
              <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-4">Please connect your wallet to view your profile.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 bg-white shadow rounded-lg">
                  <p className="text-lg text-gray-700 mb-6">
                    The profile management UI has been moved to the integration test page during the refactor.
                  </p>
                  <Link 
                    href="/test-contract"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Profile Management
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
    </ProfileGuard>
  );
}
