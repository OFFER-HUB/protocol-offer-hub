/**
 * Form component to edit profile data using update_profile_data with improved UI
 */

import { useState, useEffect } from 'react';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ImageUploadSection } from './image-upload-section';
import type { LinkedAccount } from '@/types/contract-types';

interface ProfileEditFormProps {
  onSuccess?: () => void;
}

const PLATFORM_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'Twitter/X' },
];

export function ProfileEditForm({ onSuccess }: ProfileEditFormProps) {
  const { publicKey } = useWallet();
  const { getProfile, isReady } = useOfferHubContract();
  const { updateProfile, isUpdating, error, success } = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [emailHash, setEmailHash] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [newAccountPlatform, setNewAccountPlatform] = useState('github');
  const [newAccountHandle, setNewAccountHandle] = useState('');

  // Load current profile data
  useEffect(() => {
    if (!publicKey || !isReady) return;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await getProfile(publicKey);
        if (profile) {
          setDisplayName(profile.display_name || '');
          setMetadataUri(profile.metadata_uri || '');
          setCountryCode(profile.country_code || '');
          setLinkedAccounts(profile.linked_accounts || []);
          // Email hash is not displayed (privacy), but we keep the field empty for new input
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [publicKey, isReady, getProfile]);

  const handleAddLinkedAccount = () => {
    if (!newAccountHandle.trim()) return;
    setLinkedAccounts([...linkedAccounts, { platform: newAccountPlatform, handle: newAccountHandle.trim() }]);
    setNewAccountHandle('');
  };

  const handleRemoveLinkedAccount = (index: number) => {
    setLinkedAccounts(linkedAccounts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      return;
    }

    try {
      // Generate email hash if email is provided
      let emailHashBytes: Uint8Array | undefined;
      if (emailHash.trim()) {
        const encoder = new TextEncoder();
        const data = encoder.encode(emailHash.trim().toLowerCase());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        emailHashBytes = new Uint8Array(hashBuffer);
      }

      await updateProfile({
        display_name: displayName.trim(),
        metadata_uri: metadataUri || 'ipfs://placeholder',
        country_code: countryCode || undefined,
        email_hash: emailHashBytes,
        linked_accounts: linkedAccounts.filter(acc => acc.platform && acc.handle),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled by hook
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-6 py-6">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <p className="text-primary-100 text-sm mt-1">Update your profile information</p>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {error && <ErrorAlert message={error} />}
        {success && (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800 text-sm font-medium">
            ✅ Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <ImageUploadSection
            metadataUri={metadataUri}
            onUriChange={setMetadataUri}
            error={error}
          />

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
              Display Name <span className="text-red-500">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Your name"
            />
          </div>

          {/* Country Code and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="countryCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Country Code
              </label>
              <input
                id="countryCode"
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="MX"
              />
            </div>
            <div>
              <label htmlFor="emailHash" className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-xs font-normal text-gray-500">(optional, hashed on-chain)</span>
              </label>
              <input
                id="emailHash"
                type="email"
                value={emailHash}
                onChange={(e) => setEmailHash(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Linked Accounts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Linked Accounts
              </label>
            </div>

            {/* Existing Linked Accounts */}
            {linkedAccounts.length > 0 && (
              <div className="mb-4 space-y-2">
                {linkedAccounts.map((account, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-lg">
                      {account.platform === 'github' && '🐙'}
                      {account.platform === 'linkedin' && '💼'}
                      {(account.platform === 'twitter' || account.platform === 'x') && '🐦'}
                      {!['github', 'linkedin', 'twitter', 'x'].includes(account.platform) && '🔗'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        {account.platform}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {account.handle}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLinkedAccount(index)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Linked Account */}
            <div className="flex gap-2">
              <select
                value={newAccountPlatform}
                onChange={(e) => setNewAccountPlatform(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-sm font-medium"
              >
                {PLATFORM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newAccountHandle}
                onChange={(e) => setNewAccountHandle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newAccountHandle.trim()) {
                    e.preventDefault();
                    handleAddLinkedAccount();
                  }
                }}
                placeholder="username"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddLinkedAccount}
                disabled={!newAccountHandle.trim()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isUpdating || !displayName.trim()}
              variant="primary"
              size="lg"
              isLoading={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : '💾 Update Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

