/**
 * Address search form - centered and tidy layout (no color changes)
 */

import { useEffect, useState, FormEvent } from 'react';
import { useAddressValidation } from '@/hooks/use-address-validation';

interface AddressSearchProps {
  onSearch: (address: string) => void;
  loading?: boolean;
  initialAddress?: string;
}

export function AddressSearch({ onSearch, loading = false, initialAddress = '' }: AddressSearchProps) {
  const [address, setAddress] = useState<string>(initialAddress);
  const [debounced, setDebounced] = useState<string>(initialAddress);
  const isValid = useAddressValidation(address);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(address.trim()), 300);
    return () => clearTimeout(id);
  }, [address]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isValid && address.trim()) {
      onSearch(address.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Row: input + big Search button (no extra actions) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-3 items-stretch">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Polkadot address (e.g., 5GrwvaEF5...)"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent ${address && !isValid ? 'border-red-400' : 'border-gray-300'}`}
            aria-invalid={!!address && !isValid}
            aria-describedby="address-help"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !address.trim() || !isValid}
            className="w-full h-[48px] md:h-auto px-6 py-3 rounded-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <p id="address-help" className={`text-sm text-center ${address && !isValid ? 'text-red-600' : 'text-gray-500'}`}>
          {address && !isValid ? 'Invalid Polkadot SS58 address' : 'Enter a Polkadot address to search'}
        </p>
      </div>
    </form>
  );
}


