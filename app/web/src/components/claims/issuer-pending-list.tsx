/**
 * List/table of claims issued by current issuer
 * NOTE: Claims are now created directly as Approved, so no approval action is needed.
 */

import { Claim } from '@/types/claim-types';
import { ClaimStatusBadge } from './claim-status-badge';

interface IssuerPendingListProps {
  claims: Claim[];
}

export function IssuerPendingList({ claims }: IssuerPendingListProps) {
  if (claims.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">No claims issued yet.</p>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-800">{c.id}</td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600 break-all">{c.receiver}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{c.claimType}</td>
                <td className="px-6 py-4 whitespace-nowrap"><ClaimStatusBadge approved={c.approved} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


