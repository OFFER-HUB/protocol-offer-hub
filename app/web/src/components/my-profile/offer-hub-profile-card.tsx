/**
 * Component to display Offer Hub profile information
 */

import { useUserProfile } from '@/hooks/use-user-profile';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ReputationDisplay } from './reputation-display';
import { useWallet } from '@/context/WalletContext';

export function OfferHubProfileCard() {
  const { profile, isLoading, error, hasProfile } = useUserProfile();
  const { publicKey } = useWallet();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Offer Hub Profile</h3>
        <p className="text-gray-600">No profile registered yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Register your profile to start building your on-chain reputation.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Hub Profile</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-500">Display Name</div>
          <div className="text-lg font-medium text-gray-900">{profile?.display_name || '—'}</div>
        </div>

        {profile?.country_code && (
          <div>
            <div className="text-sm text-gray-500">Country</div>
            <div className="text-gray-900">{profile.country_code}</div>
          </div>
        )}

        {profile?.linked_accounts && profile.linked_accounts.length > 0 && (
          <div>
            <div className="text-sm text-gray-500 mb-2">Linked Accounts</div>
            <div className="space-y-1">
              {profile.linked_accounts.map((account, index) => (
                <div key={index} className="text-sm text-gray-700">
                  <span className="font-medium">{account.platform}:</span>{' '}
                  <span>{account.handle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile?.metadata_uri && (
          <div>
            <div className="text-sm text-gray-500">Metadata URI</div>
            <div className="text-xs font-mono text-gray-600 break-all">{profile.metadata_uri}</div>
          </div>
        )}

        {profile?.joined_at && (
          <div>
            <div className="text-sm text-gray-500">Member Since</div>
            <div className="text-sm text-gray-700">
              {new Date(Number(profile.joined_at) * 1000).toLocaleDateString()}
            </div>
          </div>
        )}

        {publicKey && (
          <div className="pt-4 border-t border-gray-200">
            <ReputationDisplay account={publicKey} size="sm" showLabel={true} />
          </div>
        )}
      </div>
    </div>
  );
}

