/**
 * Modern form component for profile creation
 */

import { useState } from 'react';
import { useCreateProfile } from '@/hooks/use-create-profile';
import { ImageUploadSection } from './image-upload-section';
import { LinkedAccountsSection } from './linked-accounts-section';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import type { LinkedAccount } from '@/types/contract-types';

export function ProfileCreateForm() {
  const { createProfile, isCreating, error, success } = useCreateProfile();
  
  const [displayName, setDisplayName] = useState('');
  const [metadataUri, setMetadataUri] = useState('ipfs://placeholder');
  const [countryCode, setCountryCode] = useState('');
  const [email, setEmail] = useState('');
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      return;
    }

    try {
      await createProfile({
        displayName: displayName.trim(),
        metadataUri,
        countryCode: countryCode.trim() || undefined,
        email: email.trim() || undefined,
        linkedAccounts,
      });
    } catch (err) {
      // Error is handled by the hook
      console.error('Profile creation error:', err);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Profile Created Successfully!</h3>
        <p className="text-green-700">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorAlert message={error} />}

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Josué Dev"
          required
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Country Code and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country Code
          </label>
          <input
            type="text"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="MX"
            maxLength={2}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Will be hashed before storing on-chain
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <ImageUploadSection 
        metadataUri={metadataUri}
        onUriChange={setMetadataUri}
      />

      {/* Linked Accounts */}
      <LinkedAccountsSection
        linkedAccounts={linkedAccounts}
        onAccountsChange={setLinkedAccounts}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isCreating || !displayName.trim()}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isCreating ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Creating Profile...
          </span>
        ) : (
          '🚀 Create Profile'
        )}
      </button>
    </form>
  );
}

