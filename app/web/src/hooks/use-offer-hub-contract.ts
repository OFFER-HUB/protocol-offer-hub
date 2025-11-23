import { useState, useEffect, useCallback } from 'react';
import { Contract, rpc as sorobanRpc, xdr, Address as StellarAddress, TransactionBuilder, Operation } from '@stellar/stellar-sdk';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_CONFIG } from '../config/contract';
import type {
  Profile,
  Claim,
  RegisterProfileParams,
  UpdateProfileParams,
  AddClaimParams,
} from '../types/contract-types';
import { 
  parseProfile, 
  parseClaim, 
  parseClaimArray 
} from './use-offer-hub-contract-helpers';

interface UseOfferHubContractReturn {
  isReady: boolean;
  error: string | null;
  // Write functions
  registerProfile: (params: Omit<RegisterProfileParams, 'owner'>) => Promise<void>;
  updateProfileData: (params: Omit<UpdateProfileParams, 'owner'>) => Promise<void>;
  addClaim: (params: Omit<AddClaimParams, 'issuer'>) => Promise<number>;
  // Read functions
  getProfile: (account: string) => Promise<Profile | null>;
  getReputationScore: (account: string) => Promise<number>;
  getClaim: (claimId: number) => Promise<Claim | null>;
  getUserClaims: (account: string) => Promise<Claim[]>;
  getIssuerClaims: (account: string) => Promise<Claim[]>;
  getTotalClaims: () => Promise<number>;
}

// Mock issuer address for MVP demo (when wallet not connected)
const MOCK_ISSUER_ADDRESS = 'GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE';

export function useOfferHubContract(): UseOfferHubContractReturn {
  const { publicKey } = useWallet();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [rpc, setRpc] = useState<sorobanRpc.Server | null>(null);
  
  // For write operations, MUST use connected wallet (cannot use mock)
  // For read operations, can use mock address for simulation
  const issuerAddress = publicKey || MOCK_ISSUER_ADDRESS;

  useEffect(() => {
    try {
      const server = new sorobanRpc.Server(CONTRACT_CONFIG.rpcUrl);
      const contractInstance = new Contract(CONTRACT_CONFIG.contractId);
      
      setRpc(server);
      setContract(contractInstance);
      setIsReady(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setIsReady(false);
    }
  }, []);

  // Helper to invoke contract method
  const invokeContract = useCallback(async (
    method: string,
    args: xdr.ScVal[],
    signAndSubmit: boolean = true
  ) => {
    if (!contract || !rpc) {
      throw new Error('Contract not ready');
    }

    if (signAndSubmit) {
      // MUST use connected wallet - cannot use mock address for signing
      if (!publicKey) {
        throw new Error('Wallet not connected. Please connect your Freighter wallet to sign transactions.');
      }
      
      const signerAddress = publicKey;
      
      // Get account - must exist and be funded
      let account;
      try {
        account = await rpc.getAccount(signerAddress);
      } catch (e) {
        throw new Error(`Account ${signerAddress} not found or not funded. Please fund the account with Friendbot.`);
      }
      
      // Get current ledger to set proper timeout
      const latestLedger = await rpc.getLatestLedger();
      const timeout = latestLedger.sequence + 30; // 30 ledgers ahead
      
      // Build transaction with contract call
      let tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(timeout)
        .build();

      // CRITICAL: Prepare transaction (simulates + adds Soroban extension)
      let preparedTx;
      try {
        preparedTx = await rpc.prepareTransaction(tx);
      } catch (error: any) {
        console.error('Error preparing transaction:', error);
        const errorMsg = error?.message || error?.toString() || 'Failed to prepare transaction';
        throw new Error(`Transaction preparation failed: ${errorMsg}`);
      }

      // Sign with Freighter - must use the same address that built the transaction
      let signedXdr: string;
      try {
        const { signTransaction } = await import('@stellar/freighter-api');
        
        // Freighter will sign with the currently connected account
        // The transaction was built with signerAddress (publicKey), so Freighter must sign with the same account
        signedXdr = await signTransaction(preparedTx.toXDR(), {
          network: CONTRACT_CONFIG.network as any,
          accountToSign: signerAddress, // Use the same address that built the transaction
        });
        
        if (!signedXdr) {
          throw new Error('Freighter did not return a signed transaction. User may have cancelled.');
        }
      } catch (error: any) {
        console.error('Error signing transaction with Freighter:', error);
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        if (errorMsg.includes('User rejected') || errorMsg.includes('cancelled')) {
          throw new Error('Transaction cancelled by user');
        }
        throw new Error(`Failed to sign transaction: ${errorMsg}`);
      }

      // Submit the prepared and signed transaction
      const signedTx = TransactionBuilder.fromXDR(signedXdr, CONTRACT_CONFIG.networkPassphrase);
      const txResult = await rpc.sendTransaction(signedTx);

      // Check for error status safely
      if (txResult.status === 'ERROR') {
        const errorMsg = txResult.errorResult 
          ? (typeof txResult.errorResult === 'string' 
              ? txResult.errorResult 
              : JSON.stringify(txResult.errorResult))
          : 'Transaction failed';
        throw new Error(errorMsg);
      }

      // Wait for transaction to be included in a ledger
      let txResponse;
      while (true) {
        txResponse = await rpc.getTransaction(txResult.hash);
        // Check status using string comparison (more reliable across SDK versions)
        if (txResponse.status && txResponse.status !== 'NOT_FOUND') {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }

      // Extract return value if available
      if (txResponse.status === 'SUCCESS') {
        // Try to extract returnValue from transaction metadata
        try {
          if (txResponse.resultMetaXdr) {
            const meta = xdr.TransactionMeta.fromXDR(txResponse.resultMetaXdr, 'base64');
            if (meta.v3 && meta.v3().sorobanMeta && meta.v3().sorobanMeta().returnValue()) {
              const returnVal = meta.v3().sorobanMeta().returnValue();
              return { txResult, returnValue: returnVal };
            }
          }
        } catch (e) {
          console.warn('Could not extract returnValue from transaction metadata:', e);
        }
        return { txResult, returnValue: null };
      }

      return { txResult, returnValue: null };
    } else {
      // Read-only call (simulated tx)
      const simSource = issuerAddress || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'; // Null account
      
      let sourceAccount;
      try {
        sourceAccount = await rpc.getAccount(simSource);
      } catch (e) {
        console.warn('Source account for simulation not found, using default');
        throw new Error(`Source account ${simSource} not found. Fund it with Friendbot.`);
      }

      // Get current ledger for timeout
      const latestLedger = await rpc.getLatestLedger();
      const timeout = latestLedger.sequence + 30;
      
      // Build transaction for read operation
      let tx = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: CONTRACT_CONFIG.networkPassphrase,
      })
        .addOperation(contract.call(method, ...args))
        .setTimeout(timeout)
        .build();

      // Prepare transaction (simulates + adds Soroban extension)
      const preparedTx = await rpc.prepareTransaction(tx);
      
      // For read operations, we can use simulateTransaction on the prepared tx
      // or just return the simulation result from prepareTransaction
      // prepareTransaction already simulates, so we can extract the result
      const result = await rpc.simulateTransaction(preparedTx);
      
      // Manual check for simulation error
      if (sorobanRpc.Api.isSimulationError(result)) {
        throw new Error(`Simulation error: ${result.error}`);
      }

      return result; 
    }
  }, [contract, rpc, issuerAddress]);

  // Write functions
  const registerProfile = useCallback(async (params: Omit<RegisterProfileParams, 'owner'>) => {
    try {
      // Build linked accounts as ScVal maps (structs in Soroban are represented as maps)
      // CRITICAL: Keys in ScMap MUST be sorted! ('handle' comes before 'platform')
      const linkedAccountsScVal = params.linked_accounts.map(acc => {
        const mapEntries = [
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('handle'),
            val: xdr.ScVal.scvString(acc.handle)
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('platform'),
            val: xdr.ScVal.scvSymbol(acc.platform)
          })
        ];
        return xdr.ScVal.scvMap(mapEntries);
      });

      // Build arguments array
      const args: xdr.ScVal[] = [
        xdr.ScVal.scvAddress(StellarAddress.fromString(issuerAddress).toScAddress()),
        xdr.ScVal.scvString(params.metadata_uri),
        xdr.ScVal.scvString(params.display_name),
        params.country_code ? xdr.ScVal.scvSymbol(params.country_code) : xdr.ScVal.scvVoid(),
        params.email_hash ? xdr.ScVal.scvBytes(Buffer.from(params.email_hash)) : xdr.ScVal.scvVoid(),
        xdr.ScVal.scvVec(linkedAccountsScVal)
      ];
      
      await invokeContract('register_profile', args);
    } catch (error: any) {
      console.error('Error in registerProfile:', error);
      throw new Error(error?.message || 'Failed to register profile');
    }
  }, [issuerAddress, invokeContract]);

  const updateProfileData = useCallback(async (params: Omit<UpdateProfileParams, 'owner'>) => {
    const linkedAccountsScVal = params.linked_accounts.map(acc => 
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('handle'),
          val: xdr.ScVal.scvString(acc.handle)
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('platform'),
          val: xdr.ScVal.scvSymbol(acc.platform)
        })
      ])
    );
    
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(issuerAddress).toScAddress()),
      xdr.ScVal.scvString(params.display_name),
      xdr.ScVal.scvString(params.metadata_uri),
      params.country_code ? xdr.ScVal.scvSymbol(params.country_code) : xdr.ScVal.scvVoid(),
      params.email_hash ? xdr.ScVal.scvBytes(Buffer.from(params.email_hash)) : xdr.ScVal.scvVoid(),
      xdr.ScVal.scvVec(linkedAccountsScVal)
    ];
    
    await invokeContract('update_profile_data', args);
  }, [issuerAddress, invokeContract]);

  const addClaim = useCallback(async (params: Omit<AddClaimParams, 'issuer'>): Promise<number> => {
    // Convert Uint8Array to Buffer if needed
    const proofHashBuffer = Buffer.from(params.proof_hash);
    
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(issuerAddress).toScAddress()),
      xdr.ScVal.scvAddress(StellarAddress.fromString(params.receiver).toScAddress()),
      xdr.ScVal.scvString(params.claim_type),
      xdr.ScVal.scvBytes(proofHashBuffer),
    ];
    
    const result = await invokeContract('add_claim', args);
    
    // Extract claim_id from return value
    if ('returnValue' in result && result.returnValue) {
      console.log('DEBUG ADD_CLAIM returnValue:', result.returnValue);
      // Force type to xdr.ScVal as we know it's a valid ScVal from invokeContract
      const claimId = scValToNumber(result.returnValue as unknown as xdr.ScVal);
      return claimId;
    }
    
    // Fallback: try to get from transaction result
    return 0;
  }, [issuerAddress, invokeContract]);

  // Read functions
  const getProfile = useCallback(async (account: string): Promise<Profile | null> => {
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(account).toScAddress()),
    ];
    
    const result = await invokeContract('get_profile', args, false);
    if ('result' in result && result.result?.retval) {
      return parseProfile(result.result.retval);
    }
    return null;
  }, [invokeContract]);

  const getClaim = useCallback(async (claimId: number): Promise<Claim | null> => {
    const args = [xdr.ScVal.scvU64(xdr.Uint64.fromString(claimId.toString()))];
    
    const result = await invokeContract('get_claim', args, false);
    if ('result' in result && result.result?.retval) {
      return parseClaim(result.result.retval);
    }
    return null;
  }, [invokeContract]);

  const getUserClaims = useCallback(async (account: string): Promise<Claim[]> => {
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(account).toScAddress()),
    ];
    
    const result = await invokeContract('get_user_claims', args, false);
    if ('result' in result && result.result?.retval) {
      return parseClaimArray(result.result.retval);
    }
    return [];
  }, [invokeContract]);

  const getIssuerClaims = useCallback(async (account: string): Promise<Claim[]> => {
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(account).toScAddress()),
    ];
    
    const result = await invokeContract('get_issuer_claims', args, false);
    if ('result' in result && result.result?.retval) {
      return parseClaimArray(result.result.retval);
    }
    return [];
  }, [invokeContract]);

  const getTotalClaims = useCallback(async (): Promise<number> => {
    const result = await invokeContract('get_total_claims', [], false);
    if ('result' in result && result.result?.retval) {
      return scValToNumber(result.result.retval);
    }
    return 0;
  }, [invokeContract]);

  const getReputationScore = useCallback(async (account: string): Promise<number> => {
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(account).toScAddress()),
    ];
    
    const result = await invokeContract('get_reputation_score', args, false);
    if ('result' in result && result.result?.retval) {
      return scValToNumber(result.result.retval);
    }
    return 0;
  }, [invokeContract]);

  return {
    isReady,
    error,
    registerProfile,
    updateProfileData,
    addClaim,
    getProfile,
    getReputationScore,
    getClaim,
    getUserClaims,
    getIssuerClaims,
    getTotalClaims,
  };
}

// Helpers
function scValToNumber(val: xdr.ScVal): number {
  switch (val.switch()) {
    case xdr.ScValType.scvU64():
    return Number(val.u64().toString());
    case xdr.ScValType.scvI64():
      return Number(val.i64().toString());
    case xdr.ScValType.scvU32():
      return val.u32();
    case xdr.ScValType.scvI32():
      return val.i32();
    case xdr.ScValType.scvU128():
      return Number(val.u128().lo().toString());
    case xdr.ScValType.scvI128():
      return Number(val.i128().lo().toString());
    default:
  return 0;
  }
}

function scValToString(val: xdr.ScVal): string | null {
  if (val.switch() === xdr.ScValType.scvString()) {
    return val.str().toString();
  }
  if (val.switch() === xdr.ScValType.scvSymbol()) {
    return val.sym().toString();
  }
  return null;
}
