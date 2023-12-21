import { it, expect } from 'vitest';
import { createRollupFetchTransactionHash } from './createRollupFetchTransactionHash';
import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';

const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});

// Temporary test with https://arbiscan.io/tx/0xc8d7afcb2f7f7dc0883a938db4352813e17b7629850cdc54d8cc2eba7e10b095
it ('finds the transaction hash that created a specified deployed rollup contract', async () => {
  const rollupAddress = '0x846387C3D6001F74170455B1074D01f05eB3067a';
  const expectedTransactionHash = '0xc8d7afcb2f7f7dc0883a938db4352813e17b7629850cdc54d8cc2eba7e10b095';

  const transactionHash = await createRollupFetchTransactionHash(
    rollupAddress,
    publicClient
  );

  expect(transactionHash).toEqual(expectedTransactionHash);
});
