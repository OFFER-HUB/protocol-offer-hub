# Protocol Offer Hub Documentation

Welcome to the Protocol Offer Hub protocol documentation, powered by **Stellar Soroban**.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Smart Contract](#smart-contract)
3. [SDK Integration](#sdk-integration)
4. [Frontend Application](#frontend-application)
5. [Deployment Guide](#deployment-guide)
6. [Development Setup](#development-setup)

**Documentación Adicional:**
- [Contratos Desplegados](./CONTRACTS.md) - Info de contratos deployados
- [API del Contrato](./CONTRACT_API.md) - Funciones y tipos
- [Ejemplos Frontend](./FRONTEND_EXAMPLES.md) - Ejemplos de integración

## Architecture Overview

Protocol Offer Hub is a decentralized professional reputation protocol built on **Stellar**. The architecture consists of three main components:

### Components

```
┌─────────────────┐
│   Frontend App  │  Next.js 14 + TypeScript
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼─────────┐  ┌───▼──────────┐
│   Protocol SDK   │  │   Wallets    │
└────────┬─────────┘  └──────────────┘
         │              (Freighter,
         │               Albedo,
         │               xBull)
┌────────▼─────────┐
│ Soroban Contract │  ProtocolOfferHubRegistry
└──────────────────┘
         │
┌────────▼─────────┐
│     Stellar      │  Futurenet / Testnet / Mainnet
└──────────────────┘
```

### Data Flow

1. **User connects wallet** → Frontend → Freighter (or other Stellar wallet)
2. **Create profile** → SDK → Soroban Contract → Stellar Network
3. **Issue claim** → SDK → Soroban Contract → Stellar Network
4. **Approve claim** → SDK → Soroban Contract → Stellar Network
5. **Query reputation** → SDK → Soroban Contract → Display

## Smart Contract

### Contract: ProtocolOfferHubRegistry

Location: `contracts/offer-hub/`

**Deployed Contract (Testnet):**
- Contract ID: `CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V`
- Alias: `offer-hub`

#### Core Functions (Soroban)

- `register_profile(e: Env, metadata_uri: Symbol)` - Register a new user profile
- `add_claim(e: Env, receiver: Address, claim_type: Symbol, proof_hash: Symbol)` - Issue a new claim
- `approve_claim(e: Env, claim_id: u64)` - Approve an existing claim
- `get_claims(e: Env, address: Address)` - Query all claims for an address
- `get_profile(e: Env, address: Address)` - Get profile information

#### Data Structures

**Profile**
```rust
#[contracttype]
pub struct Profile {
    pub owner: Address,
    pub metadata_uri: Symbol,
    pub created_at: u64,
}
```

**Claim**
```rust
#[contracttype]
pub struct Claim {
    pub id: u64,
    pub issuer: Address,
    pub receiver: Address,
    pub claim_type: ClaimType,
    pub proof_hash: Symbol,
    pub approved: bool,
    pub timestamp: u64,
}
```

**ClaimType**
```rust
#[contracttype]
pub enum ClaimType {
    JobCompleted,
    HackathonWin,
    RepoContribution,
    SkillEndorsement,
    Other,
}
```

### Building the Contract

```bash
cd contracts/offer-hub
stellar contract build
# O usando Makefile:
make build
```

**Output:** `target/wasm32v1-none/release/offer_hub.wasm`

### Testing the Contract

```bash
cargo test
```

## SDK Integration

The TypeScript SDK provides a simple interface for integrating Protocol Offer Hub into any application using Stellar's infrastructure.

Location: `sdk/js/`

### Installation

```bash
npm install @protocol-offer-hub/sdk
```

### Quick Start

```typescript
import { ProtocolOfferHubClient, ClaimType } from '@protocol-offer-hub/sdk';
import { Keypair } from '@stellar/stellar-sdk';

// Initialize client
const client = new ProtocolOfferHubClient({
  network: 'FUTURENET',
  contractId: 'CONTRACT_ID',
  rpcUrl: 'https://rpc-futurenet.stellar.org',
});

// Create profile
await client.createProfile(
  { metadataUri: 'ipfs://...' },
  signerKeypair // or wallet signer
);

// Add claim
await client.addClaim(
  {
    receiver: 'G...', // Stellar Public Key
    claimType: ClaimType.JobCompleted,
    proofHash: '0x...',
  },
  signerKeypair
);
```

See [SDK README](../sdk/js/README.md) for full API reference.

## Frontend Application

Location: `app/web/`

Built with Next.js 14, TypeScript, and TailwindCSS.

### Features

- Wallet connection (Freighter)
- Profile creation and management
- Claim issuance and approval
- Reputation dashboard
- Responsive design

### Project Structure

```
app/web/src/
├── components/    # React components (presentation)
├── hooks/         # Custom hooks (business logic)
├── pages/         # Next.js pages (orchestration)
├── types/         # TypeScript definitions
└── styles/        # Global styles
```

### Running Locally

```bash
cd app/web
npm install
npm run dev
```

Open http://localhost:3000

## Deployment Guide

### Contratos Desplegados

#### Testnet (Stellar Testnet)

- **Contract ID**: `CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V`
- **Alias**: `offer-hub`
- **Network**: Testnet (Test SDF Network ; September 2015)
- **RPC URL**: `https://soroban-testnet.stellar.org`
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V
- **Wasm Hash**: `a8e69c26b629bd29832828ab49dd88ad4d65b7a883635a3196923bee1addf93a`
- **Deployer**: `GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE`
- **Fecha de Deploy**: 2025-01-20

**Uso en código:**
```typescript
const CONTRACT_ID = 'CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V';
const rpcUrl = 'https://soroban-testnet.stellar.org';
```

### 1. Deploy Smart Contract

#### Using Stellar CLI

```bash
# 1. Configurar red
cd contracts/offer-hub
stellar network use testnet

# 2. Crear identidad (si no existe)
stellar keys generate alice --network testnet --fund

# 3. Compilar
stellar contract build
# O usando Makefile:
make build

# 4. Deploy
stellar contract deploy \
    --wasm target/wasm32v1-none/release/offer_hub.wasm \
    --source-account alice \
    --network testnet \
    --alias offer-hub
```

#### Deploy en 2 pasos (upload + deploy)

```bash
# 1. Subir Wasm
stellar contract upload \
    --source alice \
    --network testnet \
    --wasm target/wasm32v1-none/release/offer_hub.wasm

# 2. Deploy usando hash
stellar contract deploy \
    --source alice \
    --network testnet \
    --wasm-hash <hex-encoded-wasm-hash> \
    --alias offer-hub
```

### 2. Deploy Frontend

#### Vercel

```bash
cd app/web
vercel deploy
```

#### Self-hosted

```bash
npm run build
npm start
```

### 3. Publish SDK

```bash
cd sdk/js
npm publish
```

## Development Setup

### Prerequisites

- Rust (latest stable)
- Node.js v18+
- Soroban CLI
- Freighter Wallet Extension

### Install Rust & Soroban CLI

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install WASM target
rustup target add wasm32-unknown-unknown

# Install Soroban CLI
cargo install --locked soroban-cli
```

### Install Node Dependencies

```bash
# Frontend
cd app/web
npm install

# SDK
cd ../../sdk/js
npm install
```

### Running Local Node (Stellar Quickstart)

You can use the Stellar Quickstart Docker image to run a local standalone network.

```bash
docker run --rm -it \
  -p 8000:8000 \
  --name stellar \
  stellar/quickstart:testing \
  --standalone \
  --enable-soroban-rpc
```

### Testing Full Stack

1. Start local Stellar node (Quickstart)
2. Build and deploy contract using Soroban CLI
3. Update frontend with contract ID
4. Run frontend dev server
5. Connect Freighter (configured for local/futurenet) and test features

## Network Configurations

### Local Development (Standalone)

- RPC: `http://localhost:8000/soroban/rpc`
- Network Passphrase: `Standalone Network ; February 2017`
- Friendbot: `http://localhost:8000/friendbot`

### Testnet (Deployed)

- RPC: `https://soroban-testnet.stellar.org`
- Network Passphrase: `Test SDF Network ; September 2015`
- Friendbot: `https://friendbot.stellar.org`
- **Contract ID**: `CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V`
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V

### Futurenet

- RPC: `https://rpc-futurenet.stellar.org`
- Network Passphrase: `Test SDF Future Network ; October 2022`
- Friendbot: `https://friendbot-futurenet.stellar.org`

## Resources

- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar Developers](https://developers.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Freighter Wallet](https://www.freighter.app/)

## Support

For questions or issues:
- Open an issue on GitHub
- Contact the team via Discord/Telegram
- Check the FAQ section

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT
