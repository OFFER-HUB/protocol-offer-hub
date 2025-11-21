/**
 * Component: profile-summary
 * - Pure presentation for a profile header summary
 */

import type { ProfileSummary } from '@/types/profile-types';

interface ProfileSummaryProps {
  profile: ProfileSummary;
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full text-left">
      <div className="flex items-center gap-4">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-16 h-16 rounded-full border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200" />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 truncate">{profile.displayName}</h2>
          <p className="text-gray-600 break-all text-sm">{profile.address}</p>
          {profile.bio && <p className="text-gray-500 text-sm mt-1">{profile.bio}</p>}
        </div>
        <div className="text-right">
          <div className="text-gray-900 font-semibold">{profile.approvedClaims}</div>
          <div className="text-gray-500 text-sm">Approved</div>
          <div className="text-gray-400 text-xs mt-1">of {profile.totalClaims} claims</div>
        </div>
      </div>
    </div>
  );
}


