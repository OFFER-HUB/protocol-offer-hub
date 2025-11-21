# API del Contrato Offer Hub

Documentación completa de los campos requeridos para interactuar con el contrato desde el frontend.

## 📋 Índice

- [Funciones de Escritura](#funciones-de-escritura)
- [Funciones de Lectura](#funciones-de-lectura)
- [Tipos de Datos](#tipos-de-datos)
- [Errores](#errores)
- [Validaciones](#validaciones)

---

## Funciones de Escritura

### 1. `register_profile`

Registra un nuevo perfil para el usuario autenticado.

**Parámetros:**
```typescript
{
  owner: Address,        // Dirección del wallet (se autentica automáticamente)
  metadata_uri: string   // URI del metadata (IPFS, HTTP, etc.)
}
```

**Validaciones:**
- ✅ `metadata_uri` no puede estar vacío
- ✅ `metadata_uri` máximo 256 caracteres
- ❌ No puede existir un perfil previo para `owner`

**Ejemplo:**
```typescript
await contract.register_profile({
  owner: "GABC...",  // Address de Stellar
  metadata_uri: "ipfs://QmXyZ123..." // o "https://example.com/metadata.json"
});
```

**Retorna:** `void` (éxito) o `Error`

---

### 2. `add_claim`

Añade un nuevo claim a otro usuario.

**Parámetros:**
```typescript
{
  issuer: Address,           // Dirección del emisor (se autentica)
  receiver: Address,          // Dirección del receptor
  claim_type: string,        // Tipo de claim (ej: "rust_expert", "hackathon_winner")
  proof_hash: BytesN<32>      // Hash de 32 bytes del proof (SHA-256)
}
```

**Validaciones:**
- ✅ `issuer` debe estar autenticado
- ✅ `proof_hash` debe ser exactamente 32 bytes

**Ejemplo:**
```typescript
import { hash } from 'crypto';

// Generar hash del proof (ej: certificado, documento)
const proof = JSON.stringify({
  certificate: "...",
  date: "2025-01-01"
});
const proofHash = hash('sha256').update(proof).digest(); // 32 bytes

await contract.add_claim({
  issuer: "GABC...",           // Tu dirección
  receiver: "GDEF...",         // Dirección del receptor
  claim_type: "rust_expert",
  proof_hash: proofHash         // BytesN<32>
});
```

**Retorna:** `u64` (ID del claim creado) o `Error`

---

### 3. `approve_claim`

Aprueba un claim (solo el emisor original).

**Parámetros:**
```typescript
{
  issuer: Address,    // Dirección del emisor (debe ser el que creó el claim)
  claim_id: number     // ID del claim (u64)
}
```

**Validaciones:**
- ✅ `issuer` debe estar autenticado
- ✅ `issuer` debe ser el creador original del claim
- ❌ El claim no puede estar ya aprobado
- ❌ El claim no puede estar rechazado

**Ejemplo:**
```typescript
await contract.approve_claim({
  issuer: "GABC...",    // Tu dirección (debe ser el emisor original)
  claim_id: 42          // ID del claim a aprobar
});
```

**Retorna:** `void` (éxito) o `Error`

---

### 4. `reject_claim`

Rechaza un claim (solo el emisor original).

**Parámetros:**
```typescript
{
  issuer: Address,    // Dirección del emisor (debe ser el que creó el claim)
  claim_id: number     // ID del claim (u64)
}
```

**Validaciones:**
- ✅ `issuer` debe estar autenticado
- ✅ `issuer` debe ser el creador original del claim
- ❌ El claim no puede estar ya aprobado
- ❌ El claim no puede estar rechazado

**Ejemplo:**
```typescript
await contract.reject_claim({
  issuer: "GABC...",    // Tu dirección (debe ser el emisor original)
  claim_id: 42          // ID del claim a rechazar
});
```

**Retorna:** `void` (éxito) o `Error`

---

### 5. `link_did`

Vincula un DID al perfil del usuario autenticado.

**Parámetros:**
```typescript
{
  owner: Address,    // Dirección del wallet (se autentica automáticamente)
  did: string         // DID completo (ej: "did:kilt:4r1WkS3t8rbCb11H8t3tJvGVCynwDXSUBiuGB6sLRHzCLCjs")
}
```

**Validaciones:**
- ✅ `owner` debe estar autenticado
- ✅ Debe existir un perfil para `owner`
- ✅ `did` mínimo 10 caracteres
- ✅ Formato recomendado: `did:kilt:...`

**Ejemplo:**
```typescript
await contract.link_did({
  owner: "GABC...",
  did: "did:kilt:4r1WkS3t8rbCb11H8t3tJvGVCynwDXSUBiuGB6sLRHzCLCjs"
});
```

**Retorna:** `void` (éxito) o `Error`

---

## Funciones de Lectura

### 6. `get_profile`

Obtiene el perfil de una dirección.

**Parámetros:**
```typescript
{
  account: Address    // Dirección a consultar
}
```

**Retorna:** `Profile | null`

```typescript
interface Profile {
  owner: Address;
  metadata_uri: string;
  did: string | null;  // Opcional
}
```

---

### 7. `get_claim`

Obtiene un claim por ID.

**Parámetros:**
```typescript
{
  claim_id: number    // ID del claim (u64)
}
```

**Retorna:** `Claim | null`

```typescript
interface Claim {
  id: number;
  issuer: Address;
  receiver: Address;
  claim_type: string;
  proof_hash: BytesN<32>;
  status: "Pending" | "Approved" | "Rejected";
}
```

---

### 8. `get_user_claims`

Obtiene todos los claims recibidos por un usuario.

**Parámetros:**
```typescript
{
  account: Address    // Dirección del usuario
}
```

**Retorna:** `Claim[]` (array de claims)

---

### 9. `get_issuer_claims`

Obtiene todos los claims emitidos por un usuario.

**Parámetros:**
```typescript
{
  account: Address    // Dirección del emisor
}
```

**Retorna:** `Claim[]` (array de claims)

---

### 10. `get_total_claims`

Obtiene el total de claims en el sistema.

**Parámetros:** Ninguno

**Retorna:** `number` (u64)

---

### 11. `get_did`

Obtiene el DID vinculado a una dirección.

**Parámetros:**
```typescript
{
  account: Address    // Dirección a consultar
}
```

**Retorna:** `string | null`

---

## Tipos de Datos

### `Address`
Dirección de Stellar (G... o C...)
- **Formato:** String de 56 caracteres
- **Ejemplo:** `"GABC1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEF"`

### `BytesN<32>`
Array de bytes de exactamente 32 bytes
- **Tipo:** `Uint8Array(32)` o `Buffer(32)`
- **Ejemplo:** Hash SHA-256 de un documento

### `String`
String de Soroban
- **Máximo:** Depende del contrato (metadata_uri: 256 chars)
- **Encoding:** UTF-8

### `u64`
Número entero sin signo de 64 bits
- **Rango:** 0 a 18,446,744,073,709,551,615
- **Tipo JS:** `number` o `bigint` para valores grandes

---

## Errores

El contrato puede retornar los siguientes errores:

```typescript
enum Error {
  ProfileAlreadyExists = 1,    // Perfil ya existe
  ProfileNotFound = 2,          // Perfil no encontrado
  ClaimNotFound = 3,             // Claim no encontrado
  UnauthorizedApproval = 4,     // No autorizado para aprobar
  ClaimAlreadyApproved = 5,     // Claim ya aprobado
  InvalidDid = 6,               // DID inválido
  InvalidMetadataUri = 7,       // Metadata URI inválido
  ClaimAlreadyRejected = 8      // Claim ya rechazado
}
```

---

## Validaciones del Frontend

### Antes de llamar `register_profile`:
```typescript
function validateRegisterProfile(data: { metadata_uri: string }) {
  if (!data.metadata_uri || data.metadata_uri.trim() === '') {
    throw new Error('metadata_uri es requerido');
  }
  if (data.metadata_uri.length > 256) {
    throw new Error('metadata_uri máximo 256 caracteres');
  }
  // Validar formato URI (opcional)
  try {
    new URL(data.metadata_uri);
  } catch {
    // Puede ser IPFS o formato custom
  }
}
```

### Antes de llamar `add_claim`:
```typescript
function validateAddClaim(data: {
  receiver: string;
  claim_type: string;
  proof_hash: Uint8Array;
}) {
  if (!data.receiver || !data.receiver.startsWith('G')) {
    throw new Error('receiver debe ser una dirección Stellar válida');
  }
  if (!data.claim_type || data.claim_type.trim() === '') {
    throw new Error('claim_type es requerido');
  }
  if (!data.proof_hash || data.proof_hash.length !== 32) {
    throw new Error('proof_hash debe ser exactamente 32 bytes');
  }
}
```

### Antes de llamar `link_did`:
```typescript
function validateLinkDid(data: { did: string }) {
  if (!data.did || data.did.length < 10) {
    throw new Error('DID debe tener al menos 10 caracteres');
  }
  // Validar formato did:kilt: (opcional pero recomendado)
  if (!data.did.startsWith('did:kilt:')) {
    console.warn('DID no sigue el formato did:kilt:');
  }
}
```

---

## Ejemplo Completo de Uso

```typescript
import { Contract } from '@stellar/stellar-sdk';

// 1. Registrar perfil
await contract.register_profile({
  owner: userAddress,
  metadata_uri: "ipfs://QmXyZ123..."
});

// 2. Añadir claim
const proofHash = new Uint8Array(32); // SHA-256 del proof
await contract.add_claim({
  issuer: userAddress,
  receiver: "GDEF...",
  claim_type: "rust_expert",
  proof_hash: proofHash
});

// 3. Aprobar claim
await contract.approve_claim({
  issuer: userAddress,
  claim_id: claimId
});

// 4. Vincular DID
await contract.link_did({
  owner: userAddress,
  did: "did:kilt:4r1WkS3t8rbCb11H8t3tJvGVCynwDXSUBiuGB6sLRHzCLCjs"
});

// 5. Leer datos
const profile = await contract.get_profile({ account: userAddress });
const claims = await contract.get_user_claims({ account: userAddress });
```

---

## Notas Importantes

1. **Autenticación:** Las funciones de escritura requieren que el `owner` o `issuer` esté autenticado mediante `require_auth()`.

2. **Address:** En Stellar, las direcciones pueden ser:
   - **Account:** `G...` (56 caracteres)
   - **Contract:** `C...` (56 caracteres)

3. **BytesN<32>:** Debe ser exactamente 32 bytes. Usa SHA-256 para generar hashes consistentes.

4. **Eventos:** Todas las funciones de escritura emiten eventos que puedes escuchar en el frontend.

5. **TTL:** Los datos tienen TTL de 1 año configurado en el contrato.

