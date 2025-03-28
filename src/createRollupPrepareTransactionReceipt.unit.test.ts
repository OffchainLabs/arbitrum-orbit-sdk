import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { createRollupPrepareTransactionReceipt } from './createRollupPrepareTransactionReceipt';

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

// https://sepolia.arbiscan.io/tx/0x5b0b49e0259289fc89949a55a5ad35a8939440a55065d29b14e5e7ef7494efff
it('successfully parses core contracts from a tx receipt on RollupCreator v1.1', async () => {
  const txReceipt = await client.getTransactionReceipt({
    hash: '0x5b0b49e0259289fc89949a55a5ad35a8939440a55065d29b14e5e7ef7494efff',
  });
  expect(createRollupPrepareTransactionReceipt(txReceipt).getCoreContracts()).toMatchSnapshot();
});

// https://sepolia.arbiscan.io/tx/0x77db43157182a69ce0e6d2a0564d2dabb43b306d48ea7b4d877160d6a1c9b66d
it('successfully parses core contracts from a tx receipt on RollupCreator v2.1', async () => {
  const txReceipt = await client.getTransactionReceipt({
    hash: '0x77db43157182a69ce0e6d2a0564d2dabb43b306d48ea7b4d877160d6a1c9b66d',
  });
  expect(createRollupPrepareTransactionReceipt(txReceipt).getCoreContracts()).toMatchSnapshot();
});

// https://sepolia.arbiscan.io/tx/0xda485d8ab8d47a8e9ea46677df8790b94faf3888fb1afbc52bb7bc104c29c3f3
it('successfully parses core contracts from a tx receipt on RollupCreator v3.0', async () => {
  const txReceipt = await client.getTransactionReceipt({
    hash: '0xda485d8ab8d47a8e9ea46677df8790b94faf3888fb1afbc52bb7bc104c29c3f3',
  });
  expect(createRollupPrepareTransactionReceipt(txReceipt).getCoreContracts()).toMatchSnapshot();
});
