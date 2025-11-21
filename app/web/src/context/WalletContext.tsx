import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAllowed, setAllowed, getUserInfo } from '@stellar/freighter-api';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (await isAllowed()) {
        const { publicKey } = await getUserInfo();
        if (publicKey) {
          setPublicKey(publicKey);
          setIsConnected(true);
        }
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    try {
      const allowed = await setAllowed();
      if (allowed) {
        const { publicKey } = await getUserInfo();
        if (publicKey) {
          setPublicKey(publicKey);
          setIsConnected(true);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to connect wallet:', error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setPublicKey(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        publicKey,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
