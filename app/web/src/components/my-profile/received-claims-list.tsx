/**
 * Component to display list of claims received by the user
 */

import { useUserClaims } from '@/hooks/use-user-claims';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ClaimStatusBadge } from '@/components/claims/claim-status-badge';
import type { Claim } from '@/types/contract-types';

interface ReceivedClaimsListProps {
  account: string | null;
  showTitle?: boolean;
  maxItems?: number;
}

export function ReceivedClaimsList({ account, showTitle = true, maxItems }: ReceivedClaimsListProps) {
  const { claims, isLoading, error } = useUserClaims(account);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Claims</h3>}
        <ErrorAlert message={error} />
      </div>
    );
  }

  const displayClaims = maxItems ? claims.slice(0, maxItems) : claims;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Received Claims {claims.length > 0 && `(${claims.length})`}
        </h3>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No claims received yet.</p>
          <p className="text-sm mt-2">Claims will appear here once others issue them to you.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {displayClaims.map((claim) => (
            <li key={claim.id} className="py-4 flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{claim.claim_type}</span>
                  {claim.status === 'Approved' && <ClaimStatusBadge approved={true} />}
                </div>
                <p className="text-xs text-gray-600">
                  Issuer: <span className="font-mono">{claim.issuer.slice(0, 12)}…{claim.issuer.slice(-4)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Proof: <span className="font-mono">{Array.from(new Uint8Array(claim.proof_hash)).slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('')}…</span>
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="text-xs text-gray-500">Claim #{claim.id}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {maxItems && claims.length > maxItems && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Showing {maxItems} of {claims.length} claims
          </p>
        </div>
      )}
    </div>
  );
}

