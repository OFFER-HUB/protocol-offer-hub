/**
 * List/table of claims pending approval by current issuer
 * NOTE: The contract does not expose a query to fetch claims by issuer.
 * This component expects a list provided by the parent (mock or indexed).
 */

import { Claim } from '@/types/claim-types';
import { ClaimStatusBadge } from './claim-status-badge';
import { useApproveClaim } from '@/hooks/use-approve-claim';

interface IssuerPendingListProps {
  claims: Claim[];
  onApproved?: (claimId: number) => void;
}

export function IssuerPendingList({ claims, onApproved }: IssuerPendingListProps) {
  const { approve, isSubmitting, error } = useApproveClaim();

  const pending = claims.filter((c) => !c.approved);

  const handleApprove = async (id: number) => {
    await approve(id);
    onApproved?.(id);
  };

  if (pending.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">No pending claims to approve.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pending.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-800">{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600 break-all">{c.receiver}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{c.claimType}</td>
                <td className="px-6 py-4 whitespace-nowrap"><ClaimStatusBadge approved={c.approved} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleApprove(c.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Approving...' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && (
        <div className="border-t border-gray-200 p-3 text-sm text-red-700 bg-red-50">
          {error}
        </div>
      )}
    </div>
  );
}


