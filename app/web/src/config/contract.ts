export const CONTRACT_CONFIG = {
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || '',
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'FUTURENET',
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://rpc-futurenet.stellar.org',
};
