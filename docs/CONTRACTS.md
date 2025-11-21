# Contratos Desplegados

## Testnet

```
Contract ID: CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V
Alias: offer-hub
RPC: https://soroban-testnet.stellar.org
Explorer: https://stellar.expert/explorer/testnet/contract/CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V
Wasm Hash: a8e69c26b629bd29832828ab49dd88ad4d65b7a883635a3196923bee1addf93a
Deployer: GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE (admin)
Deploy: 2025-01-20
```

### Uso

```typescript
const CONTRACT_ID = 'CBWZZEF73NLFP24M2LPRF5JXWOPINYPUVPDF2UTAZUS3YFZ6OG7OVR4V';
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

