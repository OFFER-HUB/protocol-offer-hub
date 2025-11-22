/**
 * Component to display reputation score prominently
 */

import { useReputationScore } from '@/hooks/use-reputation-score';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

interface ReputationDisplayProps {
  account: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReputationDisplay({ account, showLabel = true, size = 'md' }: ReputationDisplayProps) {
  const { score, isLoading, error } = useReputationScore(account);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <ErrorAlert message={error} />
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={`bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md ${containerSizeClasses[size]}`}>
      {showLabel && (
        <div className="text-sm font-medium text-primary-700 mb-2">Reputation Score</div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className={`font-bold text-primary-600 ${sizeClasses[size]}`}>
          {score !== null ? score : '—'}
        </div>
      )}
      {score !== null && !isLoading && (
        <div className="text-xs text-primary-600 mt-2">
          Based on approved claims and account age
        </div>
      )}
    </div>
  );
}

