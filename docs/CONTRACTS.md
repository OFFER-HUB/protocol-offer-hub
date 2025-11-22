# Contratos Desplegados

## Testnet

```
Contract ID: CCBYVXQXGVUGTKLRK7A3GQPP2RYSHCFAPH2UG2INP3YB3IKAERME4QMP
Alias: offer-hub
RPC: https://soroban-testnet.stellar.org
Explorer: https://stellar.expert/explorer/testnet/contract/CCBYVXQXGVUGTKLRK7A3GQPP2RYSHCFAPH2UG2INP3YB3IKAERME4QMP
Wasm Hash: 70039d9ee182659ce00aa5ccc0969eabf27f2b19bf16527783a312a638919735
Deployer: GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE (admin)
Deploy: 2025-01-21
```

### Uso

```typescript
const CONTRACT_ID = 'CCBYVXQXGVUGTKLRK7A3GQPP2RYSHCFAPH2UG2INP3YB3IKAERME4QMP';
const rpcUrl = 'https://soroban-testnet.stellar.org';
```

### Deploy

```bash
cd contracts/offer-hub
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/offer_hub.wasm \
  --source-account admin \
  --network testnet \
  --alias offer-hub
```

