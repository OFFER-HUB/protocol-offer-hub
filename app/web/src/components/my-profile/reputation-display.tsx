/**
 * Component to display reputation score prominently
 */

import { useEffect } from 'react';
import { useReputationScore } from '@/hooks/use-reputation-score';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface ReputationDisplayProps {
  account: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReputationDisplay({ account, showLabel = true, size = 'md' }: ReputationDisplayProps) {
  const { score, isLoading, error, refresh } = useReputationScore(account);

  // Refresh score when window gains focus
  useEffect(() => {
    if (!account) return;

    // Refresh when window gains focus (user returns to tab)
    const handleFocus = () => {
      refresh();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [account, refresh]);

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
        <ErrorAlert message={error} />
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const containerSizeClasses = {
    sm: 'p-5',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`relative bg-gradient-to-br from-primary-50 via-primary-100/80 to-primary-200/60 rounded-xl shadow-lg border border-primary-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] h-full ${containerSizeClasses[size]}`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        {showLabel && (
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-primary-200/50 rounded-lg">
              <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-primary-800 uppercase tracking-wide">Reputation Score</div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center flex-grow py-6">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="flex flex-col flex-grow justify-center space-y-3">
            <div className={`font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent ${sizeClasses[size]} transition-all duration-500 leading-none`}>
              {score !== null ? score : '—'}
            </div>
            {score !== null && !isLoading && (
              <div className="flex items-center gap-1.5 text-[10px] text-primary-700/80">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Based on approved claims and account age</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

