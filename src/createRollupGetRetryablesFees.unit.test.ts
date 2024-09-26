import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { createRollupGetRetryablesFees } from './createRollupGetRetryablesFees';

const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

it('successfully fetches retryable fees for an eth-based chain', async () => {
  const x = await createRollupGetRetryablesFees({
    publicClient: arbitrumSepoliaClient,
    nativeToken: false,
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(x).toBeTypeOf('bigint');
});

it('successfully fetches retryable fees for a custom gas token chain', async () => {
  const x = await createRollupGetRetryablesFees({
    publicClient: arbitrumSepoliaClient,
    nativeToken: true,
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(x).toBeTypeOf('bigint');
});
