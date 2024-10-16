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
    account: '0x38f918D0E9F1b721EDaA41302E399fa1B79333a9',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
  expect(fees).toBeGreaterThanOrEqual(124708400000000000n);
});

it.only('successfully fetches retryable fees for a custom gas token chain', async () => {
  const fees = await createRollupGetRetryablesFees(sepoliaClient, {
    account: '0x38f918D0E9F1b721EDaA41302E399fa1B79333a9',
    nativeToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
  expect(fees).toEqual(124708400000000000n);

  const usdcFees = await createRollupGetRetryablesFees(sepoliaClient, {
    account: '0x38f918D0E9F1b721EDaA41302E399fa1B79333a9',
    nativeToken: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(usdcFees).toBeTypeOf('bigint');
  expect(usdcFees).toEqual(124708400000000000n);
});
