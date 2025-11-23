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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        {showTitle && <h3 className="text-xl font-bold text-gray-900 mb-4">Issued Claims</h3>}
        <ErrorAlert message={error} />
      </div>
    );
  }

  const displayClaims = maxItems ? claims.slice(0, maxItems) : claims;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {showTitle && (
        <div className="bg-gradient-to-r from-gray-50 to-primary-50/50 px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Issued Claims {claims.length > 0 && (
                  <span className="ml-2 px-2.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                    {claims.length}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      )}

      <div className="p-4 md:p-5">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1.5">No claims issued yet</h4>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              You haven&apos;t issued any claims yet. Your issued claims will appear here once you create them.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayClaims.map((claim, index) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="block group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 hover:scale-[1.005]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="p-1 bg-primary-100 rounded-lg">
                            <svg className="w-3.5 h-3.5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{claim.claim_type}</span>
                        </div>
                        <ClaimStatusBadge approved={claim.status === 'Approved'} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium">Receiver:</span>
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{claim.receiver.slice(0, 12)}…{claim.receiver.slice(-4)}</span>
                        </div>
                        {showDetails && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="font-medium">Proof:</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">0x{proofHashToHex(claim.proof_hash).slice(0, 8)}…</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <div className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-[10px] font-semibold border border-primary-200">
                        #{claim.id}
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {maxItems && claims.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600 font-medium">
              Showing <span className="text-primary-700 font-semibold">{maxItems}</span> of <span className="text-primary-700 font-semibold">{claims.length}</span> claims
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

