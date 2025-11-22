/**
 * Form component to edit profile data using update_profile_data
 */

import { useState, useEffect } from 'react';
import { useUpdateProfile } from '@/hooks/use-update-profile';
import { useOfferHubContract } from '@/hooks/use-offer-hub-contract';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { LinkedAccount } from '@/types/contract-types';

interface ProfileEditFormProps {
  onSuccess?: () => void;
}

export function ProfileEditForm({ onSuccess }: ProfileEditFormProps) {
  const { publicKey } = useWallet();
  const { getProfile, isReady } = useOfferHubContract();
  const { updateProfile, isUpdating, error, success } = useUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

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
    setLinkedAccounts([...linkedAccounts, { platform: '', handle: '' }]);
  };

  const handleRemoveLinkedAccount = (index: number) => {
    setLinkedAccounts(linkedAccounts.filter((_, i) => i !== index));
  };

  const handleUpdateLinkedAccount = (index: number, field: 'platform' | 'handle', value: string) => {
    const updated = [...linkedAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setLinkedAccounts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile({
        display_name: displayName,
        metadata_uri: metadataUri,
        country_code: countryCode || undefined,
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>

      {error && <ErrorAlert message={error} />}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="metadataUri" className="block text-sm font-medium text-gray-700 mb-1">
            Metadata URI *
          </label>
          <input
            id="metadataUri"
            type="text"
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            required
            maxLength={256}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://example.com/metadata.json"
          />
          <p className="mt-1 text-xs text-gray-500">Max 256 characters</p>
        </div>

        <div>
          <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700 mb-1">
            Country Code (optional)
          </label>
          <input
            id="countryCode"
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="US"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Linked Accounts</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLinkedAccount}
            >
              Add Account
            </Button>
          </div>
          {linkedAccounts.length === 0 ? (
            <p className="text-sm text-gray-500">No linked accounts</p>
          ) : (
            <div className="space-y-2">
              {linkedAccounts.map((account, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={account.platform}
                    onChange={(e) => handleUpdateLinkedAccount(index, 'platform', e.target.value)}
                    placeholder="Platform (e.g., GitHub)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={account.handle}
                    onChange={(e) => handleUpdateLinkedAccount(index, 'handle', e.target.value)}
                    placeholder="Handle"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveLinkedAccount(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? <LoadingSpinner size="sm" /> : 'Update Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}

