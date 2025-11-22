import { xdr, scValToNative, Address } from '@stellar/stellar-sdk';
import type { Profile, Claim, ClaimStatus, ProofHash } from '../types/contract-types';

export function scValToAddress(val: xdr.ScVal): string {
  try {
    return Address.fromScVal(val).toString();
  } catch {
    return '';
  }
}

export function parseProfile(val: xdr.ScVal | undefined): Profile {
  if (!val) return { owner: '', metadata_uri: '', display_name: '', country_code: null, email_hash: null, linked_accounts: [], joined_at: 0 };
  
  const native = scValToNative(val);
  if (!native) return { owner: '', metadata_uri: '', display_name: '', country_code: null, email_hash: null, linked_accounts: [], joined_at: 0 };

  return {
    owner: native.owner || '',
    metadata_uri: native.metadata_uri?.toString() || '',
    display_name: native.display_name?.toString() || '',
    country_code: native.country_code?.toString() || null,
    email_hash: native.email_hash instanceof Uint8Array ? native.email_hash : null,
    linked_accounts: native.linked_accounts || [],
    joined_at: Number(native.joined_at),
  };
}

export function parseClaim(val: xdr.ScVal | undefined): Claim {
  if (!val) return {} as Claim;
  
  const native = scValToNative(val);
  if (!native) return {} as Claim;

  // Helper to convert proof_hash (BytesN) to Uint8Array
  const proofHash = native.proof_hash instanceof Uint8Array 
    ? native.proof_hash 
    : new Uint8Array(32);

  // Claims are created directly as Approved
  const status: ClaimStatus = 'Approved';
  
  return {
    id: Number(native.id),
    issuer: native.issuer?.toString() || '',
    receiver: native.receiver?.toString() || '',
    claim_type: native.claim_type?.toString() || '',
    proof_hash: proofHash,
    status,
  };
}

export function parseClaimArray(val: xdr.ScVal | undefined): Claim[] {
  if (!val) return [];
  try {
    const vec = val.vec();
    if (!vec) return [];
    return vec.map(v => parseClaim(v));
  } catch {
    // Try native conversion if it's a vector
    const native = scValToNative(val);
    if (Array.isArray(native)) {
      // Re-wrap to ScVal to reuse parseClaim logic or parse native object directly
      // Simpler to trust native conversion for basic structs
      return native.map((n: any) => ({
        id: Number(n.id),
        issuer: n.issuer?.toString() || '',
        receiver: n.receiver?.toString() || '',
        claim_type: n.claim_type?.toString() || '',
        proof_hash: n.proof_hash instanceof Uint8Array ? n.proof_hash : new Uint8Array(32),
        status: 'Approved' as ClaimStatus,
      }));
    }
    return [];
  }
}

