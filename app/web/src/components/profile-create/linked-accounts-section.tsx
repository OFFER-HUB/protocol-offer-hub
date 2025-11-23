/**
 * Component for managing linked accounts (GitHub, LinkedIn, Twitter)
 */

import { useState } from 'react';
import type { LinkedAccount } from '@/types/contract-types';

interface LinkedAccountsSectionProps {
  linkedAccounts: LinkedAccount[];
  onAccountsChange: (accounts: LinkedAccount[]) => void;
}

export function LinkedAccountsSection({ 
  linkedAccounts, 
  onAccountsChange 
}: LinkedAccountsSectionProps) {
  const [newAccountPlatform, setNewAccountPlatform] = useState('github');
  const [newAccountHandle, setNewAccountHandle] = useState('');

  const handleAddLinkedAccount = () => {
    if (!newAccountHandle.trim()) {
      return;
    }
    
    const newAccount: LinkedAccount = {
      platform: newAccountPlatform,
      handle: newAccountHandle.trim(),
    };
    
    onAccountsChange([...linkedAccounts, newAccount]);
    setNewAccountHandle('');
  };

  const handleRemoveLinkedAccount = (index: number) => {
    onAccountsChange(linkedAccounts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Linked Accounts
        <span className="text-gray-400 font-normal ml-2">(optional)</span>
      </label>
      
      {/* Existing accounts */}
      {linkedAccounts.length > 0 && (
        <div className="space-y-2">
          {linkedAccounts.map((acc, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <span className="font-semibold text-blue-700 capitalize">
                  {acc.platform}:
                </span>
                <span className="text-gray-700">{acc.handle}</span>
              </span>
              <button
                onClick={() => handleRemoveLinkedAccount(idx)}
                className="text-red-600 hover:text-red-800 font-bold text-lg leading-none px-2 py-1 hover:bg-red-50 rounded transition-colors"
                aria-label="Remove account"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add new account */}
      <div className="flex gap-2">
        <select
          value={newAccountPlatform}
          onChange={(e) => setNewAccountPlatform(e.target.value)}
          className="p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="github">GitHub</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter</option>
        </select>
        <input
          type="text"
          value={newAccountHandle}
          onChange={(e) => setNewAccountHandle(e.target.value)}
          placeholder="username"
          className="flex-1 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newAccountHandle.trim()) {
              handleAddLinkedAccount();
            }
          }}
        />
        <button
          onClick={handleAddLinkedAccount}
          disabled={!newAccountHandle.trim()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

