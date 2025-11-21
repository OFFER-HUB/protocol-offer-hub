# Protocol Offer Hub SDK

TypeScript SDK for integrating with the Protocol Offer Hub protocol on Stellar.

## Installation

```bash
npm install @protocol-offer-hub/sdk
```

## Usage

### Initialize the client

```typescript
import { ProtocolOfferHubClient } from '@protocol-offer-hub/sdk';
import { Keypair } from '@stellar/stellar-sdk';

// Initialize Protocol Offer Hub client
const client = new ProtocolOfferHubClient({
  network: 'FUTURENET',
  contractId: 'YOUR_CONTRACT_ID',
  rpcUrl: 'https://rpc-futurenet.stellar.org',
});
```

### Create a profile

```typescript
const result = await client.createProfile(
  {
    metadataUri: 'ipfs://QmYourMetadataHash',
  },
  signerKeypair
);
```

### Add a claim

```typescript
import { ClaimType } from '@protocol-offer-hub/sdk';

const result = await client.addClaim(
  {
    receiver: 'G...', // Stellar Public Key
    claimType: ClaimType.JobCompleted,
    proofHash: '0x1234...',
  },
  signerKeypair
);
```

### Approve a claim

```typescript
const result = await client.approveClaim(
  {
    claimId: 1,
  },
  signerKeypair
);
```

### Query claims

```typescript
const claims = await client.getClaimsByAddress(
  'G...' // Stellar Public Key
);
```

### Query profile

```typescript
const profile = await client.getProfile(
  'G...' // Stellar Public Key
);
```

## API Reference

### ProtocolOfferHubClient

Main client class for interacting with the Protocol Offer Hub protocol.

#### Methods

- `createProfile(options, signer)` - Create a new on-chain profile
- `addClaim(options, signer)` - Add a new claim
- `approveClaim(options, signer)` - Approve an existing claim
- `getClaimsByAddress(address)` - Get all claims for an address
- `getProfile(address)` - Get profile for an address
- `disconnect()` - Cleanup and disconnect

### Types

See [types.ts](./src/types.ts) for all type definitions.

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run watch
```

## License

MIT
