/**
 * Component to preview receiver profile when creating a claim
 */

import { useExploreProfile } from '@/hooks/use-explore-profile';
import { useReputationScore } from '@/hooks/use-reputation-score';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useAddressValidation } from '@/hooks/use-address-validation';

interface ReceiverPreviewProps {
  receiverAddress: string;
}

export function ReceiverPreview({ receiverAddress }: ReceiverPreviewProps) {
  const isValidAddress = useAddressValidation(receiverAddress);
  const { profile, isLoading, error } = useExploreProfile(
    isValidAddress ? receiverAddress : null
  );
  const { score, isLoading: isLoadingScore } = useReputationScore(
    isValidAddress ? receiverAddress : null
  );

  if (!receiverAddress || !isValidAddress) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-700">Loading receiver profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Could not load profile for this address. You can still create the claim.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          No profile found for this address. The receiver may not have registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Receiver Profile</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium text-blue-800">{profile.display_name || 'Unnamed'}</span>
            </div>
            <div className="font-mono text-xs text-blue-600 break-all">{receiverAddress}</div>
            {profile.country_code && (
              <div className="text-blue-700">📍 {profile.country_code}</div>
            )}
            {profile.linked_accounts && profile.linked_accounts.length > 0 && (
              <div className="text-blue-700">
                {profile.linked_accounts.length} linked account{profile.linked_accounts.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-sm text-blue-600 mb-1">Reputation</div>
          {isLoadingScore ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="text-lg font-bold text-blue-900">{score !== null ? score : '—'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

