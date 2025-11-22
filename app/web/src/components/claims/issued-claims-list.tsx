/**
 * Component to display list of claims issued by an account
 */

import { useIssuedClaims } from '@/hooks/use-issued-claims';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ClaimStatusBadge } from './claim-status-badge';
import { proofHashToHex } from '@/types/contract-types';
import Link from 'next/link';

interface IssuedClaimsListProps {
  account: string | null;
  showTitle?: boolean;
  maxItems?: number;
  showDetails?: boolean;
}

export function IssuedClaimsList({ 
  account, 
  showTitle = true, 
  maxItems,
  showDetails = false 
}: IssuedClaimsListProps) {
  const { claims, isLoading, error, refresh } = useIssuedClaims(account);

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Issued Claims</h3>}
        <ErrorAlert message={error} />
      </div>
    );
  }

  const displayClaims = maxItems ? claims.slice(0, maxItems) : claims;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Issued Claims {claims.length > 0 && `(${claims.length})`}
          </h3>
          <button
            onClick={refresh}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Refresh
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No claims issued yet.</p>
          <p className="text-sm mt-2">Claims you create will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receiver
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showDetails && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proof Hash
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Link 
                      href={`/claims/${claim.id}`}
                      className="font-mono text-sm text-primary-600 hover:text-primary-700"
                    >
                      #{claim.id}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-mono text-xs text-gray-600 break-all max-w-xs">
                      {claim.receiver}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.claim_type}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <ClaimStatusBadge approved={claim.status === 'Approved'} />
                  </td>
                  {showDetails && (
                    <td className="px-4 py-4">
                      <div className="font-mono text-xs text-gray-500 break-all max-w-xs">
                        0x{proofHashToHex(claim.proof_hash).slice(0, 16)}...
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

