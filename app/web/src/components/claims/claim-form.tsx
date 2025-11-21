/**
 * Form to create a new claim (layout adjusted, no color changes)
 */

import { useState, FormEvent } from 'react';
import { ClaimType } from '@/types/claim-types';
import { useAddressValidation } from '@/hooks/use-address-validation';

interface ClaimFormProps {
  onSubmit: (data: { receiver: string; claimType: ClaimType; proofHash: string }) => Promise<void> | void;
  submitting?: boolean;
  error?: string | null;
  initialReceiver?: string;
}

const claimTypeOptions = Object.values(ClaimType);

export function ClaimForm({ onSubmit, submitting = false, error, initialReceiver = '' }: ClaimFormProps) {
  const [receiver, setReceiver] = useState(initialReceiver);
  const [claimType, setClaimType] = useState<ClaimType>(ClaimType.JobCompleted);
  const [proofHash, setProofHash] = useState('');

  const isValidAddress = useAddressValidation(receiver);
  const isValidHash = proofHash.startsWith('0x') && proofHash.length === 66;
  const canSubmit = isValidAddress && isValidHash && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({ receiver: receiver.trim(), claimType, proofHash: proofHash.trim() });
  };

  return (
    <div className="max-w-3xl mx-auto"> {/* constrain width to previous layout */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6" aria-label="Create new claim">
        <div>
          <label className="block text-sm font-medium text-gray-700">Receiver Address</label>
          <input
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border rounded-lg ${receiver && !isValidAddress ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="Enter receiver SS58 address"
            aria-invalid={!!receiver && !isValidAddress}
          />
          <p className={`mt-1 text-xs ${receiver && !isValidAddress ? 'text-red-600' : 'text-gray-500'}`}>
            {receiver && !isValidAddress ? 'Invalid SS58 address' : 'Paste a valid Polkadot address'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Claim Type</label>
          <select
            value={claimType}
            onChange={(e) => setClaimType(e.target.value as any)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            {claimTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Proof Hash (0x + 64 hex)</label>
          <input
            value={proofHash}
            onChange={(e) => setProofHash(e.target.value)}
            className={`mt-1 w-full px-3 py-2 border rounded-lg ${proofHash && !isValidHash ? 'border-red-400' : 'border-gray-300'}`}
            placeholder="0x..."
            aria-invalid={!!proofHash && !isValidHash}
          />
          <p className={`mt-1 text-xs ${proofHash && !isValidHash ? 'text-red-600' : 'text-gray-500'}`}>
            {proofHash && !isValidHash ? 'Must be 32-byte hex (length 66)' : 'Example: 0xabc123...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full md:w-auto px-8 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Create Claim'}
          </button>
        </div>
      </form>
    </div>
  );
}


