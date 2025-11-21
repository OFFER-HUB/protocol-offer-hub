# Protocol Offer Hub — On-Chain Professional Reputation Protocol

**Protocol Offer Hub** is a decentralized professional reputation protocol built on Stellar Soroban, enabling freelancers, developers, and Web3 contributors to register, verify, and publicly showcase validated achievements on-chain. The protocol creates a powerful, portable, and verifiable professional identity system.

## 🎯 Overview

Protocol Offer Hub is implemented as a **Soroban smart contract** deployed on the Stellar network. The protocol allows users to:

- **Register Professional Profiles**: Create on-chain profiles that serve as public, verifiable professional identities
- **Issue and Verify Claims**: Register achievements, work completions, and contributions as claims that can be approved by issuers (clients, DAOs, organizations)
- **Showcase Reputation**: Display validated history and achievements publicly on-chain

Validations (e.g., "completed a job", "won a hackathon", "contributed to a repo") are registered as claims that can be approved on-chain by another entity (e.g., a client, a DAO, or an organization). Each claim includes proof hashes stored off-chain (on IPFS, Arweave, or other storage solutions) and can be verified by anyone.

### Built on Stellar Soroban

Protocol Offer Hub leverages the **Stellar network** to provide a decentralized, interoperable reputation system. By deploying on Stellar with Soroban smart contracts, the protocol benefits from:

- **Fast Finality**: Sub-second transaction confirmation
- **Low Transaction Costs**: Efficient execution with Soroban smart contracts
- **Scalability**: Stellar's architecture allows for high throughput
- **Security**: Proven network security with billions in value secured
- **Global Reach**: Stellar's global network enables worldwide access

The protocol integrates seamlessly with Stellar's native technologies:
- **Soroban** for smart contract development
- **Stellar SDK** for blockchain interaction
- **Freighter** for wallet integration and user experience

## 🏗️ Project Structure

```
protocol-offer-hub/
├── contracts/              # Soroban smart contracts
├── sdk/js/                 # TypeScript SDK for integrations
├── app/web/                # Next.js frontend application
├── docs/                   # Technical documentation
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Rust** (latest stable) with `wasm32-unknown-unknown` target
- **Soroban CLI**
- **Node.js** v18+ and npm/yarn/pnpm

### Setup

1. **Install Rust and Soroban CLI:**

```bash
rustup target add wasm32-unknown-unknown
cargo install --locked soroban-cli
```

2. **Install dependencies:**

```bash
# Frontend
cd app/web
npm install

# SDK
cd ../../sdk/js
npm install
```

3. **Build the smart contract:**

```bash
cd contracts/
soroban contract build
```

4. **Run the frontend:**

```bash
cd app/web
npm run dev
```

## 📦 Components

### Smart Contracts

#### Protocol Offer Hub Registry (`contracts/`)

The registry contract provides:
- `register_profile(metadata_uri)`
- `add_claim(receiver, claim_type, proof_hash)`
- `approve_claim(claim_id)`
- `get_claims(address)`
- `get_profile(address)`

### Frontend (`app/web/`)

Next.js 14 application with:
- Wallet connection (Freighter)
- On-chain profile creation
- Achievement visualization
- Claim issuance and approval

### SDK (`sdk/js/`)

TypeScript SDK for external integrations with functions:
- `createProfile()`
- `addClaim()`
- `approveClaim()`
- `getClaimsByAddress()`

## 🛠️ Tech Stack

### Web3 Technologies
- **Soroban** - Smart contracts for Stellar network
- **Stellar** - Blockchain network
- **Freighter** - Wallet integration

### Development Stack
- **Smart Contracts:** Rust, Soroban
- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **SDK:** TypeScript, @stellar/stellar-sdk
- **Wallets:** Freighter
- **Testing:** Jest

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📬 Contact

For questions or collaboration opportunities, please open an issue or reach out to the Protocol Offer Hub team.
