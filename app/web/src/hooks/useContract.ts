import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';

interface UseContractReturn {
  isReady: boolean;
  error: string | null;
  invoke: (method: string, args?: any[]) => Promise<any>;
}

export function useContract(): UseContractReturn {
  const { isConnected } = useWallet();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [isConnected]);

  const invoke = useCallback(async (method: string, args: any[] = []) => {
    if (!isConnected) throw new Error('Wallet not connected');
    
    // TODO: Implement Soroban invocation
    if (process.env.NODE_ENV === 'development') {
      console.log(`Invoking ${method} with args:`, args);
    }
    return null;
  }, [isConnected]);

  return {
    isReady,
    error,
    invoke,
  };
}
