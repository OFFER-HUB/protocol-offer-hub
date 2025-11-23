/**
 * Component: profile-card-with-fallback
 * - Tries to fetch real profile data from contract
 * - Falls back to mock data if profile doesn't exist
 */

import { useExploreProfile } from '@/hooks/use-explore-profile';
import { ProfileSummaryReal } from './profile-summary-real';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Profile } from '@/types/contract-types';

interface ProfileCardWithFallbackProps {
  address: string;
  mockProfile: Profile;
}

export function ProfileCardWithFallback({ address, mockProfile }: ProfileCardWithFallbackProps) {
  const { profile, isLoading, error } = useExploreProfile(address);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  // Use real profile if available, otherwise use mock
  const displayProfile = profile || mockProfile;

  // If there's an error but we have mock data, show mock with a note
  if (error && !profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-full">
        <div className="mb-2 text-xs text-gray-500 italic">
          Using mock data (profile not found on-chain)
        </div>
        <ProfileSummaryReal profile={mockProfile} address={address} />
      </div>
    );
  }

  // Show real profile or mock profile
  return <ProfileSummaryReal profile={displayProfile} address={address} />;
}

