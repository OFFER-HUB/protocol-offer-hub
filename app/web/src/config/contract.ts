export const CONTRACT_CONFIG = {
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || 'CCBYVXQXGVUGTKLRK7A3GQPP2RYSHCFAPH2UG2INP3YB3IKAERME4QMP',
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'TESTNET',
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
};
