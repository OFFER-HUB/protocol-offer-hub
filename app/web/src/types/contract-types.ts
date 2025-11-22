/**
 * Tipos TypeScript para interactuar con el contrato Offer Hub
 * Basado en el contrato Rust en contracts/offer-hub/src/
 */

// Address de Stellar (Account o Contract)
export type Address = string;

// BytesN<32> - Hash de 32 bytes
export type ProofHash = Uint8Array | Buffer;

// Status de un claim (claims are created directly as Approved)
export type ClaimStatus = 'Approved';

// ============================================================================
// TIPOS DE DATOS DEL CONTRATO
// ============================================================================

/**
 * Linked account (e.g. GitHub, LinkedIn)
 */
export interface LinkedAccount {
  platform: string;
  handle: string;
}

/**
 * Perfil de usuario
 */
export interface Profile {
  owner: Address;
  metadata_uri: string;
  did: string | null;
  display_name: string;
  country_code: string | null;
  email_hash: ProofHash | null;
  linked_accounts: LinkedAccount[];
  joined_at: number; // u64 timestamp
}

/**
 * Claim (afirmación/credencial)
 */
export interface Claim {
  id: number; // u64
  issuer: Address;
  receiver: Address;
  claim_type: string;
  proof_hash: ProofHash;
  status: ClaimStatus;
}

// ============================================================================
// PARÁMETROS DE ENTRADA PARA FUNCIONES
// ============================================================================

/**
 * Parámetros para register_profile
 */
export interface RegisterProfileParams {
  owner: Address;
  metadata_uri: string; // Máximo 256 caracteres, no vacío
  display_name: string;
  country_code?: string; // Optional 2 letter code
  email_hash?: ProofHash;
  linked_accounts: LinkedAccount[];
}

/**
 * Parámetros para update_profile_data
 */
export interface UpdateProfileParams {
  owner: Address;
  display_name: string;
  metadata_uri: string;
  country_code?: string;
  email_hash?: ProofHash;
  linked_accounts: LinkedAccount[];
}

/**
 * Parámetros para add_claim
 */
export interface AddClaimParams {
  issuer: Address;
  receiver: Address;
  claim_type: string;
  proof_hash: ProofHash; // Exactamente 32 bytes
}

/**
 * Parámetros para link_did
 */
export interface LinkDidParams {
  owner: Address;
  did: string; // Mínimo 10 caracteres, formato recomendado: did:kilt:...
}

/**
 * Parámetros para get_profile
 */
export interface GetProfileParams {
  account: Address;
}

/**
 * Parámetros para get_claim
 */
export interface GetClaimParams {
  claim_id: number; // u64
}

/**
 * Parámetros para get_user_claims
 */
export interface GetUserClaimsParams {
  account: Address;
}

/**
 * Parámetros para get_issuer_claims
 */
export interface GetIssuerClaimsParams {
  account: Address;
}

/**
 * Parámetros para get_did
 */
export interface GetDidParams {
  account: Address;
}

/**
 * Parámetros para get_reputation_score
 */
export interface GetReputationScoreParams {
  account: Address;
}

// ============================================================================
// ERRORES DEL CONTRATO
// ============================================================================

export enum ContractError {
  ProfileAlreadyExists = 1,
  ProfileNotFound = 2,
  ClaimNotFound = 3,
  InvalidDid = 6,
  InvalidMetadataUri = 7,
}

/**
 * Mapeo de errores a mensajes legibles
 */
export const ErrorMessages: Record<ContractError, string> = {
  [ContractError.ProfileAlreadyExists]: 'Ya existe un perfil para esta dirección',
  [ContractError.ProfileNotFound]: 'No se encontró un perfil para esta dirección',
  [ContractError.ClaimNotFound]: 'No se encontró el claim',
  [ContractError.InvalidDid]: 'Formato de DID inválido',
  [ContractError.InvalidMetadataUri]: 'URI de metadata inválido',
};

// ============================================================================
// VALIDADORES
// ============================================================================

/**
 * Valida que metadata_uri cumpla con los requisitos
 */
export function validateMetadataUri(uri: string): void {
  if (!uri || uri.trim() === '') {
    throw new Error('metadata_uri es requerido');
  }
  if (uri.length > 256) {
    throw new Error('metadata_uri máximo 256 caracteres');
  }
}

/**
 * Valida que proof_hash sea exactamente 32 bytes
 */
export function validateProofHash(hash: ProofHash): void {
  const bytes = hash instanceof Uint8Array ? hash : new Uint8Array(hash);
  if (bytes.length !== 32) {
    throw new Error('proof_hash debe ser exactamente 32 bytes');
  }
}

/**
 * Valida formato de DID
 */
export function validateDid(did: string): void {
  if (!did || did.length < 10) {
    throw new Error('DID debe tener al menos 10 caracteres');
  }
  // Opcional: validar formato did:kilt:
  if (!did.startsWith('did:') && process.env.NODE_ENV === 'development') {
    console.warn('DID no sigue el formato estándar (did:...)');
  }
}

/**
 * Valida formato de Address de Stellar
 */
export function validateAddress(address: Address): void {
  if (!address || address.length !== 56) {
    throw new Error('Address debe tener 56 caracteres');
  }
  if (!address.startsWith('G') && !address.startsWith('C')) {
    throw new Error('Address debe comenzar con G (Account) o C (Contract)');
  }
}

/**
 * Genera hash SHA-256 de un string o objeto
 */
export async function generateProofHash(data: string | object): Promise<ProofHash> {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(text);
  
  // Usar Web Crypto API si está disponible (navegador)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return new Uint8Array(hashBuffer);
  }
  
  // Fallback para Node.js (requiere crypto module)
  // En Node.js usar: import { createHash } from 'crypto';
  throw new Error('SHA-256 no disponible. Usa crypto.subtle o crypto module de Node.js');
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convierte un string hex a ProofHash
 */
export function hexToProofHash(hex: string): ProofHash {
  const bytes = new Uint8Array(32);
  if (hex.length !== 64) {
    throw new Error('Hex string debe tener 64 caracteres (32 bytes)');
  }
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Convierte ProofHash a string hex
 */
export function proofHashToHex(hash: ProofHash): string {
  const bytes = hash instanceof Uint8Array ? hash : new Uint8Array(hash);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

