/**
 * Types: profile-types
 * - Contracts for profile exploration
 */

export interface ProfileSummary {
  address: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  totalClaims: number;
  approvedClaims: number;
}

export interface ExploreProfileState {
  isLoading: boolean;
  error: string | null;
  profile: ProfileSummary | null;
}


