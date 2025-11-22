import { useState, useEffect, useCallback } from 'react';
import { Contract, SorobanRpc, xdr, Address as StellarAddress, TransactionBuilder, Operation } from '@stellar/stellar-sdk';
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
  linkDid: (did: string) => Promise<void>;
  // Read functions
  getProfile: (account: string) => Promise<Profile | null>;
  getReputationScore: (account: string) => Promise<number>;
  getClaim: (claimId: number) => Promise<Claim | null>;
  getUserClaims: (account: string) => Promise<Claim[]>;
  getIssuerClaims: (account: string) => Promise<Claim[]>;
  getTotalClaims: () => Promise<number>;
  getDid: (account: string) => Promise<string | null>;
}

export function useOfferHubContract(): UseOfferHubContractReturn {
  const { isConnected, publicKey } = useWallet();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [rpc, setRpc] = useState<SorobanRpc.Server | null>(null);

  useEffect(() => {
    try {
      const server = new SorobanRpc.Server(CONTRACT_CONFIG.rpcUrl);
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
      if (!publicKey) throw new Error('Wallet not connected');
      
      // Get account
      const account = await rpc.getAccount(publicKey);
      
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
      const preparedTx = await rpc.prepareTransaction(tx);

      // Sign with Freighter
      const { signTransaction } = await import('@stellar/freighter-api');
      const signedXdr = await signTransaction(preparedTx.toXDR(), {
        network: CONTRACT_CONFIG.network as any,
        accountToSign: publicKey,
      });

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
        if (txResponse.status !== SorobanRpc.GetTransactionStatus.NOT_FOUND) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }

      // Extract return value if available
      if (txResponse.status === SorobanRpc.GetTransactionStatus.SUCCESS && txResponse.resultXdr) {
        const result = xdr.TransactionResult.fromXDR(txResponse.resultXdr, 'base64');
        const operationResults = result.result().results();
        if (operationResults && operationResults.length > 0) {
          const invokeResult = operationResults[0].tr().invokeHostFunctionResult();
          if (invokeResult && invokeResult.success()) {
            const returnValue = invokeResult.success().returnValue();
            return { txResult, returnValue };
          }
        }
      }

      return { txResult, returnValue: null };
    } else {
      // Read-only call (simulated tx)
      const simSource = publicKey || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'; // Null account
      
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
      if (SorobanRpc.Api.isSimulationError(result)) {
        throw new Error(`Simulation error: ${result.error}`);
      }

      return result; 
    }
  }, [contract, rpc, publicKey]);

  // Write functions
  const registerProfile = useCallback(async (params: Omit<RegisterProfileParams, 'owner'>) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    const linkedAccountsScVal = params.linked_accounts.map(acc => 
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('platform'),
          val: xdr.ScVal.scvSymbol(acc.platform)
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('handle'),
          val: xdr.ScVal.scvString(acc.handle)
        })
      ])
    );

    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(publicKey).toScAddress()),
      xdr.ScVal.scvString(params.metadata_uri),
      xdr.ScVal.scvString(params.display_name),
      params.country_code ? xdr.ScVal.scvString(params.country_code) : xdr.ScVal.scvVoid(),
      params.email_hash ? xdr.ScVal.scvBytes(Buffer.from(params.email_hash)) : xdr.ScVal.scvVoid(),
      xdr.ScVal.scvVec(linkedAccountsScVal)
    ];
    
    await invokeContract('register_profile', args);
  }, [publicKey, invokeContract]);

  const updateProfileData = useCallback(async (params: Omit<UpdateProfileParams, 'owner'>) => {
    if (!publicKey) throw new Error('Wallet not connected');

    const linkedAccountsScVal = params.linked_accounts.map(acc => 
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('platform'),
          val: xdr.ScVal.scvSymbol(acc.platform)
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('handle'),
          val: xdr.ScVal.scvString(acc.handle)
        })
      ])
    );
    
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(publicKey).toScAddress()),
      xdr.ScVal.scvString(params.display_name),
      xdr.ScVal.scvString(params.metadata_uri),
      params.country_code ? xdr.ScVal.scvString(params.country_code) : xdr.ScVal.scvVoid(),
      params.email_hash ? xdr.ScVal.scvBytes(Buffer.from(params.email_hash)) : xdr.ScVal.scvVoid(),
      xdr.ScVal.scvVec(linkedAccountsScVal)
    ];
    
    await invokeContract('update_profile_data', args);
  }, [publicKey, invokeContract]);

  const addClaim = useCallback(async (params: Omit<AddClaimParams, 'issuer'>): Promise<number> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    // Convert Uint8Array to Buffer if needed
    const proofHashBuffer = Buffer.from(params.proof_hash);
    
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(publicKey).toScAddress()),
      xdr.ScVal.scvAddress(StellarAddress.fromString(params.receiver).toScAddress()),
      xdr.ScVal.scvString(params.claim_type),
      xdr.ScVal.scvBytes(proofHashBuffer),
    ];
    
    const result = await invokeContract('add_claim', args);
    
    // Extract claim_id from return value
    if (result.returnValue) {
      const claimId = scValToNumber(result.returnValue);
      return claimId;
    }
    
    // Fallback: try to get from transaction result
    return 0;
  }, [publicKey, invokeContract]);

  const linkDid = useCallback(async (did: string) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(publicKey).toScAddress()),
      xdr.ScVal.scvString(did),
    ];
    
    await invokeContract('link_did', args);
  }, [publicKey, invokeContract]);

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

  const getDid = useCallback(async (account: string): Promise<string | null> => {
    const args = [
      xdr.ScVal.scvAddress(StellarAddress.fromString(account).toScAddress()),
    ];
    
    const result = await invokeContract('get_did', args, false);
    if ('result' in result && result.result?.retval) {
      return scValToString(result.result.retval);
    }
    return null;
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
    linkDid,
    getProfile,
    getReputationScore,
    getClaim,
    getUserClaims,
    getIssuerClaims,
    getTotalClaims,
    getDid,
  };
}

// Helpers
function scValToNumber(val: xdr.ScVal): number {
  if (val.switch() === xdr.ScValType.scvU64()) {
    return Number(val.u64().toString());
  }
  return 0;
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
