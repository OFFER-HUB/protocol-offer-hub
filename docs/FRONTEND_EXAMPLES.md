# Ejemplos de Uso del Contrato desde el Frontend

Ejemplos prácticos de cómo preparar y enviar datos al contrato Offer Hub.

## 📦 Instalación

```bash
npm install @stellar/stellar-sdk
```

## 🔧 Configuración Inicial

```typescript
import { Contract, SorobanRpc, Networks } from '@stellar/stellar-sdk';
import type {
  RegisterProfileParams,
  AddClaimParams,
  ApproveClaimParams,
  LinkDidParams,
  generateProofHash,
  validateMetadataUri,
  validateDid,
  validateProofHash,
} from '@/types/contract-types';

// Configurar RPC (Testnet)
const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org', {
  allowHttp: true,
});

// ID del contrato desplegado (Testnet)
const CONTRACT_ID = 'CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V';

// Crear instancia del contrato
const contract = new Contract(CONTRACT_ID);
```

---

## 📝 Ejemplo 1: Registrar Perfil

```typescript
import { useWallet } from '@/context/WalletContext';
import { validateMetadataUri } from '@/types/contract-types';

export function useRegisterProfile() {
  const { address, signTransaction } = useWallet();

  const registerProfile = async (metadataUri: string) => {
    // 1. Validar datos
    validateMetadataUri(metadataUri);

    // 2. Preparar parámetros
    const params: RegisterProfileParams = {
      owner: address!, // Address del usuario autenticado
      metadata_uri: metadataUri,
    };

    // 3. Crear transacción
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call('register_profile', params.owner, params.metadata_uri)
      )
      .setTimeout(30)
      .build();

    // 4. Firmar y enviar
    const signedTx = await signTransaction(transaction);
    const result = await rpc.sendTransaction(signedTx);
    
    return result;
  };

  return { registerProfile };
}
```

**Uso en componente:**
```tsx
function ProfileSetup() {
  const { registerProfile } = useRegisterProfile();
  const [metadataUri, setMetadataUri] = useState('');

  const handleSubmit = async () => {
    try {
      await registerProfile(metadataUri);
      alert('Perfil registrado exitosamente');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={metadataUri}
        onChange={(e) => setMetadataUri(e.target.value)}
        placeholder="ipfs://QmXyZ..."
        maxLength={256}
      />
      <button type="submit">Registrar Perfil</button>
    </form>
  );
}
```

---

## 📝 Ejemplo 2: Añadir Claim

```typescript
import { generateProofHash, validateProofHash } from '@/types/contract-types';

export function useAddClaim() {
  const { address, signTransaction } = useWallet();

  const addClaim = async (
    receiver: Address,
    claimType: string,
    proof: string | object // Certificado, documento, etc.
  ) => {
    // 1. Generar hash del proof
    const proofHash = await generateProofHash(proof);
    validateProofHash(proofHash);

    // 2. Validar receiver
    if (!receiver || receiver.length !== 56) {
      throw new Error('Dirección del receptor inválida');
    }

    // 3. Preparar parámetros
    const params: AddClaimParams = {
      issuer: address!,
      receiver,
      claim_type: claimType,
      proof_hash: proofHash,
    };

    // 4. Crear y enviar transacción
    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          'add_claim',
          params.issuer,
          params.receiver,
          params.claim_type,
          params.proof_hash
        )
      )
      .setTimeout(30)
      .build();

    const signedTx = await signTransaction(transaction);
    const result = await rpc.sendTransaction(signedTx);
    
    // 5. Obtener claim_id del resultado
    const claimId = result.returnValue?.toNumber();
    return claimId;
  };

  return { addClaim };
}
```

**Uso en componente:**
```tsx
function ClaimForm() {
  const { addClaim } = useAddClaim();
  const [receiver, setReceiver] = useState('');
  const [claimType, setClaimType] = useState('');
  const [certificate, setCertificate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // El proof puede ser un objeto con los datos del certificado
      const proof = {
        certificate,
        date: new Date().toISOString(),
        issuer: 'Tu organización',
      };

      const claimId = await addClaim(receiver, claimType, proof);
      alert(`Claim creado con ID: ${claimId}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        placeholder="Dirección del receptor (G...)"
        maxLength={56}
      />
      <input
        value={claimType}
        onChange={(e) => setClaimType(e.target.value)}
        placeholder="Tipo de claim (ej: rust_expert)"
      />
      <textarea
        value={certificate}
        onChange={(e) => setCertificate(e.target.value)}
        placeholder="Datos del certificado (JSON)"
      />
      <button type="submit">Crear Claim</button>
    </form>
  );
}
```

---

## 📝 Ejemplo 3: Aprobar Claim

```typescript
export function useApproveClaim() {
  const { address, signTransaction } = useWallet();

  const approveClaim = async (claimId: number) => {
    const params: ApproveClaimParams = {
      issuer: address!,
      claim_id: claimId,
    };

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call('approve_claim', params.issuer, params.claim_id)
      )
      .setTimeout(30)
      .build();

    const signedTx = await signTransaction(transaction);
    const result = await rpc.sendTransaction(signedTx);
    
    return result;
  };

  return { approveClaim };
}
```

**Uso en componente:**
```tsx
function PendingClaimsList() {
  const { approveClaim } = useApproveClaim();
  const [claims, setClaims] = useState<Claim[]>([]);

  const handleApprove = async (claimId: number) => {
    try {
      await approveClaim(claimId);
      alert('Claim aprobado exitosamente');
      // Refrescar lista
      loadClaims();
    } catch (error) {
      if (error.code === ContractError.UnauthorizedApproval) {
        alert('No estás autorizado para aprobar este claim');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      {claims.map((claim) => (
        <div key={claim.id}>
          <p>Claim #{claim.id}: {claim.claim_type}</p>
          <p>Receptor: {claim.receiver}</p>
          <button onClick={() => handleApprove(claim.id)}>
            Aprobar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Ejemplo 4: Vincular DID

```typescript
import { validateDid } from '@/types/contract-types';

export function useLinkDid() {
  const { address, signTransaction } = useWallet();

  const linkDid = async (did: string) => {
    // Validar formato
    validateDid(did);

    const params: LinkDidParams = {
      owner: address!,
      did,
    };

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call('link_did', params.owner, params.did)
      )
      .setTimeout(30)
      .build();

    const signedTx = await signTransaction(transaction);
    const result = await rpc.sendTransaction(signedTx);
    
    return result;
  };

  return { linkDid };
}
```

**Uso en componente:**
```tsx
function DidLinker() {
  const { linkDid } = useLinkDid();
  const [did, setDid] = useState('');

  const handleLink = async () => {
    try {
      await linkDid(did);
      alert('DID vinculado exitosamente');
    } catch (error) {
      if (error.code === ContractError.InvalidDid) {
        alert('Formato de DID inválido');
      } else if (error.code === ContractError.ProfileNotFound) {
        alert('Primero debes registrar un perfil');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <input
        value={did}
        onChange={(e) => setDid(e.target.value)}
        placeholder="did:kilt:..."
      />
      <button onClick={handleLink}>Vincular DID</button>
    </div>
  );
}
```

---

## 📖 Ejemplo 5: Leer Datos

```typescript
export function useReadContract() {
  const readProfile = async (account: Address) => {
    const result = await rpc.callContract(
      CONTRACT_ID,
      'get_profile',
      account
    );
    return result.returnValue as Profile | null;
  };

  const readClaim = async (claimId: number) => {
    const result = await rpc.callContract(
      CONTRACT_ID,
      'get_claim',
      claimId
    );
    return result.returnValue as Claim | null;
  };

  const readUserClaims = async (account: Address) => {
    const result = await rpc.callContract(
      CONTRACT_ID,
      'get_user_claims',
      account
    );
    return result.returnValue as Claim[];
  };

  const readTotalClaims = async () => {
    const result = await rpc.callContract(
      CONTRACT_ID,
      'get_total_claims'
    );
    return result.returnValue?.toNumber() || 0;
  };

  return {
    readProfile,
    readClaim,
    readUserClaims,
    readTotalClaims,
  };
}
```

**Uso:**
```tsx
function ProfileView() {
  const { readProfile, readUserClaims } = useReadContract();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const userAddress = 'G...'; // Address del usuario
      const profileData = await readProfile(userAddress);
      const claimsData = await readUserClaims(userAddress);
      
      setProfile(profileData);
      setClaims(claimsData);
    };

    loadData();
  }, []);

  if (!profile) {
    return <div>No hay perfil registrado</div>;
  }

  return (
    <div>
      <h2>Perfil</h2>
      <p>Owner: {profile.owner}</p>
      <p>Metadata: {profile.metadata_uri}</p>
      <p>DID: {profile.did || 'No vinculado'}</p>

      <h3>Claims Recibidos ({claims.length})</h3>
      {claims.map((claim) => (
        <div key={claim.id}>
          <p>{claim.claim_type} - {claim.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔐 Manejo de Errores

```typescript
import { ContractError, ErrorMessages } from '@/types/contract-types';

function handleContractError(error: any) {
  if (error.code && error.code in ContractError) {
    const errorCode = error.code as ContractError;
    return ErrorMessages[errorCode];
  }
  return error.message || 'Error desconocido';
}

// Uso
try {
  await registerProfile(metadataUri);
} catch (error) {
  const message = handleContractError(error);
  console.error(message);
  alert(message);
}
```

---

## 📊 Resumen de Campos Requeridos

| Función | Campos Requeridos | Validaciones |
|---------|-------------------|--------------|
| `register_profile` | `owner`, `metadata_uri` | metadata_uri: 1-256 chars |
| `add_claim` | `issuer`, `receiver`, `claim_type`, `proof_hash` | proof_hash: 32 bytes |
| `approve_claim` | `issuer`, `claim_id` | issuer debe ser el creador |
| `reject_claim` | `issuer`, `claim_id` | issuer debe ser el creador |
| `link_did` | `owner`, `did` | did: mínimo 10 chars |
| `get_profile` | `account` | - |
| `get_claim` | `claim_id` | - |
| `get_user_claims` | `account` | - |
| `get_issuer_claims` | `account` | - |
| `get_total_claims` | - | - |
| `get_did` | `account` | - |

