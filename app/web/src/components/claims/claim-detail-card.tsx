/**
 * Component to display detailed information about a single claim
 */

import { useClaimDetail } from '@/hooks/use-claim-detail';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ClaimStatusBadge } from './claim-status-badge';
import { proofHashToHex } from '@/types/contract-types';

interface ClaimDetailCardProps {
  claimId: number;
  showTitle?: boolean;
  onRefresh?: () => void;
}

export function ClaimDetailCard({ claimId, showTitle = true, onRefresh }: ClaimDetailCardProps) {
  const { claim, isLoading, error, refresh } = useClaimDetail(claimId);

  const handleRefresh = () => {
    refresh();
    if (onRefresh) onRefresh();
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h3>}
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h3>}
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        {showTitle && <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Details</h3>}
        <div className="text-center py-8 text-gray-500">
          <p>Claim not found</p>
        </div>
      </div>
    );
  }

  const proofHashHex = proofHashToHex(claim.proof_hash);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Claim Details</h3>
          <button
            onClick={handleRefresh}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Claim ID</div>
            <div className="text-lg font-semibold text-gray-900">#{claim.id}</div>
          </div>
          <ClaimStatusBadge approved={claim.status === 'Approved'} />
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Claim Type</div>
          <div className="text-gray-900">{claim.claim_type}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Issuer</div>
            <div className="font-mono text-sm text-gray-600 break-all">
              {claim.issuer}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Receiver</div>
            <div className="font-mono text-sm text-gray-600 break-all">
              {claim.receiver}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-700 mb-1">Proof Hash</div>
          <div className="font-mono text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
            0x{proofHashHex}
          </div>
        </div>
      </div>
    </div>
  );
}

