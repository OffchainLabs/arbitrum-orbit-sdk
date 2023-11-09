# Arbitrum Orbit SDK

TypeScript SDK for building [Arbitrum Orbit](https://arbitrum.io/orbit) chains.

## Example

```typescript
import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumGoerli } from 'viem/chains';

import {
  createRollupPrepareConfig,
  createRollupPrepareTransactionRequest,
} from '@arbitrum/orbit-sdk';
import { generateChainId } from '@arbitrum/orbit-sdk/utils';

// Create a public client for Arbitrum Goerli
const publicClient = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(),
});

// Create an account from your private key
const account = privateKeyToAccount(
  sanitizePrivateKey(process.env.PRIVATE_KEY)
);

// Prepare the transaction request for creating the rollup
const request = await createRollupPrepareTransactionRequest({
  params: {
    config: createRollupPrepareConfig({
      chainId: BigInt(generateChainId()),
      owner: account.address,
    }),
    batchPoster: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    validators: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
  },
  account: account.address,
  publicClient,
});

// Sign and send the transaction
const txHash = await publicClient.sendRawTransaction({
  serializedTransaction: await account.signTransaction(request),
});

console.log(`Rollup deployed in transaction: ${txHash}`);
```
