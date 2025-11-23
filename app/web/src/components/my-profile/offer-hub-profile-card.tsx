/**
 * Component to display Offer Hub profile information with modern UI
 */

import { useUserProfile } from '@/hooks/use-user-profile';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ReputationDisplay } from './reputation-display';
import { useWallet } from '@/context/WalletContext';

interface OfferHubProfileCardProps {
  onEditClick?: () => void;
}

export function OfferHubProfileCard({ onEditClick }: OfferHubProfileCardProps) {
  const { profile, isLoading, error, hasProfile } = useUserProfile();
  const { publicKey } = useWallet();

  const getImageUrl = (uri: string) => {
    if (uri.startsWith('ipfs://')) {
      return uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
    }
    return uri;
  };

  const getPlatformIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase();
    if (lowerPlatform.includes('github')) return '🐙';
    if (lowerPlatform.includes('linkedin')) return '💼';
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x')) return '🐦';
    return '🔗';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Profile Found</h3>
          <p className="text-gray-600 mb-1">No profile registered yet.</p>
          <p className="text-sm text-gray-500">
            Register your profile to start building your on-chain reputation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {profile?.metadata_uri && !profile.metadata_uri.startsWith('ipfs://placeholder') ? (
              <div className="relative">
                <img
                  src={getImageUrl(profile.metadata_uri)}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Profile';
                  }}
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl text-white font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profile?.display_name || '—'}</h2>
              {profile?.country_code && (
                <div className="flex items-center gap-2 text-primary-100 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{profile.country_code}</span>
                </div>
              )}
            </div>
          </div>
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/30"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Reputation Score */}
        {publicKey && (
          <div className="bg-gradient-to-br from-primary-50 via-primary-100/80 to-primary-200/60 rounded-xl p-6 border border-primary-200/50">
            <ReputationDisplay account={publicKey} size="md" showLabel={true} />
          </div>
        )}

        {/* Linked Accounts */}
        {profile?.linked_accounts && profile.linked_accounts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Linked Accounts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.linked_accounts.map((account, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <span className="text-2xl">{getPlatformIcon(account.platform)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {account.platform}
                    </div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {account.handle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member Since */}
        {profile?.joined_at && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Member since:</span>
              <span>{new Date(Number(profile.joined_at) * 1000).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

