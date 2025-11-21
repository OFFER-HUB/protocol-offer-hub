/**
 * Recent claims list/cards for Home
 */

import type { Claim } from '@/types/claim-types';
import { ClaimStatusBadge } from './claim-status-badge';

interface RecentClaimsProps {
  claims: Claim[];
  loading?: boolean;
  error?: string | null;
}

export function RecentClaims({ claims, loading = false, error = null }: RecentClaimsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600 text-center">No recent claims yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Claims</h3>
      <ul className="divide-y divide-gray-200">
        {claims.map((c) => (
          <li key={c.id} className="py-4 flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{c.claimType}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Issuer: <span className="font-mono">{c.issuer.slice(0, 10)}…</span>
              </p>
              <p className="text-xs text-gray-600">
                Receiver: <span className="font-mono">{c.receiver.slice(0, 10)}…</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ClaimStatusBadge approved={c.approved} />
              <span className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


