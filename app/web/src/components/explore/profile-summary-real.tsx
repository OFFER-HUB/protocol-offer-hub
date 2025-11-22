/**
 * Component: profile-summary-real
 * - Displays real profile data from contract with reputation score
 */

import { useReputationScore } from '@/hooks/use-reputation-score';
import { useUserClaims } from '@/hooks/use-user-claims';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReputationDisplay } from '@/components/my-profile/reputation-display';
import type { Profile } from '@/types/contract-types';
import Link from 'next/link';
import { Button } from '@/components/Button';

interface ProfileSummaryRealProps {
  profile: Profile;
  address: string;
}

export function ProfileSummaryReal({ profile, address }: ProfileSummaryRealProps) {
  const { score, isLoading: isLoadingScore } = useReputationScore(address);
  const { claims, isLoading: isLoadingClaims } = useUserClaims(address);

  const approvedClaims = claims.filter(c => c.status === 'Approved').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Profile Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {profile.display_name || 'Unnamed Profile'}
          </h2>
          <p className="font-mono text-sm text-gray-600 break-all mb-3">{address}</p>
          
          {profile.country_code && (
            <p className="text-sm text-gray-600 mb-2">📍 {profile.country_code}</p>
          )}

          {profile.linked_accounts && profile.linked_accounts.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Linked Accounts</div>
              <div className="flex flex-wrap gap-2">
                {profile.linked_accounts.map((account, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs text-gray-700"
                  >
                    {account.platform}: {account.handle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.metadata_uri && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 break-all">{profile.metadata_uri}</div>
            </div>
          )}
        </div>

        {/* Right: Stats and Actions */}
        <div className="flex flex-col gap-4 md:w-64">
          {/* Reputation Score */}
          <div>
            <ReputationDisplay account={address} size="sm" showLabel={true} />
          </div>

          {/* Claims Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {isLoadingClaims ? '—' : approvedClaims}
              </div>
              <div className="text-sm text-gray-600">Approved Claims</div>
              <div className="text-xs text-gray-500 mt-1">
                of {isLoadingClaims ? '—' : claims.length} total
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Link href={`/claims/new?receiver=${encodeURIComponent(address)}`}>
            <Button variant="primary" className="w-full">
              Issue Claim
            </Button>
          </Link>
        </div>
      </div>

      {/* Claims List Preview */}
      {claims.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Claims</h3>
          <div className="space-y-2">
            {claims.slice(0, 3).map((claim) => (
              <div key={claim.id} className="text-sm text-gray-600">
                <span className="font-medium">{claim.claim_type}</span>
                {' '}from{' '}
                <span className="font-mono text-xs">
                  {claim.issuer.slice(0, 8)}…{claim.issuer.slice(-4)}
                </span>
              </div>
            ))}
            {claims.length > 3 && (
              <Link href={`/explore?address=${encodeURIComponent(address)}`}>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  View all {claims.length} claims →
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

