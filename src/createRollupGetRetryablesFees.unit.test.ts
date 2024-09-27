import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei } from 'viem';
import { sepolia } from 'viem/chains';

import { createRollupGetRetryablesFees } from './createRollupGetRetryablesFees';

const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

it('successfully fetches retryable fees for an eth-based chain', async () => {
  const fees = await createRollupGetRetryablesFees(sepoliaClient, {
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
});

it('successfully fetches retryable fees for a custom gas token chain', async () => {
  const fees = await createRollupGetRetryablesFees(sepoliaClient, {
    nativeToken: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
});