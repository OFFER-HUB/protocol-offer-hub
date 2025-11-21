# Offer Hub Contract

Smart contract para gestionar perfiles, claims y DIDs en Stellar/Soroban.

## Estructura del Proyecto

```
src/
├── lib.rs          # Entry point del contrato
├── contract.rs     # Implementación del contrato (#[contract], #[contractimpl])
├── types.rs        # Tipos de datos personalizados (#[contracttype])
├── errors.rs       # Errores del contrato (#[contracterror])
├── events.rs       # Eventos del contrato (#[contractevent])
├── storage.rs      # Helpers para storage (keys, TTLs, getters/setters)
├── auth.rs         # Lógica de autorización y validaciones
└── test.rs         # Tests unitarios e integración
```

## Versiones

- **Rust**: ≥ 1.84.0
- **Stellar CLI**: 23.2.1
- **Soroban SDK**: 23.2.1
- **Target**: wasm32v1-none

## Prerequisitos

```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Añadir target wasm32v1-none
rustup target add wasm32v1-none

# Instalar Stellar CLI
cargo install --locked stellar-cli --version 23.2.1
```

## Desarrollo

### Compilar el contrato

```bash
stellar contract build
```

El archivo WASM resultante estará en:
```
target/wasm32v1-none/release/offer_hub.wasm
```

### Ejecutar tests

```bash
cargo test
```

### Ejecutar tests con output

```bash
cargo test -- --nocapture
```

### Optimizar para producción

```bash
stellar contract build --release
stellar contract optimize --wasm target/wasm32v1-none/release/offer_hub.wasm
```

## Funcionalidades

### Profiles

- `register_profile(owner, metadata_uri)` - Registrar un nuevo perfil
- `link_did(owner, did)` - Vincular un DID al perfil
- `get_profile(account)` - Obtener perfil de una cuenta
- `get_did(account)` - Obtener DID de una cuenta

### Claims

- `add_claim(issuer, receiver, claim_type, proof_hash)` - Añadir un claim
- `approve_claim(issuer, claim_id)` - Aprobar un claim
- `reject_claim(issuer, claim_id)` - Rechazar un claim
- `get_claim(claim_id)` - Obtener detalles de un claim
- `get_user_claims(account)` - Obtener claims recibidos por un usuario
- `get_issuer_claims(account)` - Obtener claims emitidos por un usuario
- `get_total_claims()` - Obtener total de claims

## Eventos

El contrato emite los siguientes eventos:

- `ProfileRegisteredEvent` - Cuando se registra un perfil
- `ClaimAddedEvent` - Cuando se añade un claim
- `ClaimApprovedEvent` - Cuando se aprueba un claim
- `ClaimRejectedEvent` - Cuando se rechaza un claim
- `DidLinkedEvent` - Cuando se vincula un DID

## Tests

El contrato incluye tests comprehensivos para:

- ✅ Registro de perfiles (éxito, duplicados, validaciones)
- ✅ Gestión de claims (añadir, aprobar, rechazar)
- ✅ Vinculación de DIDs
- ✅ Control de autorizaciones
- ✅ Getters y queries
- ✅ Flujos de trabajo completos

Total: **28 tests**

## Despliegue

### Testnet

```bash
# Configurar identidad
stellar keys generate alice --network testnet

# Desplegar contrato
stellar contract deploy \
  --wasm target/wasm32v1-none/release/offer_hub.wasm \
  --source alice \
  --network testnet

# Invocar funciones
stellar contract invoke \
  --id CONTRACT_ID \
  --source alice \
  --network testnet \
  -- \
  register_profile \
  --owner ALICE_ADDRESS \
  --metadata_uri "ipfs://QmExample"
```

### Mainnet

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/offer_hub.wasm \
  --source alice \
  --network mainnet
```

## Licencia

MIT

