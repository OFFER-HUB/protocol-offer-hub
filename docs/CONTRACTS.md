# Contratos Desplegados

## Testnet

```
Contract ID: CDSFHKYGY74SYQJNQSMCRQBO4FAUFQ4E5SWPA27T76T2KCISCMTBLH76
Alias: offer-hub
RPC: https://soroban-testnet.stellar.org
Explorer: https://stellar.expert/explorer/testnet/contract/CDSFHKYGY74SYQJNQSMCRQBO4FAUFQ4E5SWPA27T76T2KCISCMTBLH76
Wasm Hash: b94731b2d5cdc60ea0b2f99cf70b8d54d45cc0a55c4e7222c1e3bcbe86e5b31c
Deployer: GBMTZAVSCGUS4EJG72AMNYHRCRS3INCSDOPAICTX3RD5REOV657N7UPE (admin)
Deploy: 2025-01-22
```

### Uso

```typescript
const CONTRACT_ID = 'CDSFHKYGY74SYQJNQSMCRQBO4FAUFQ4E5SWPA27T76T2KCISCMTBLH76';
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

