import { it, expect } from 'vitest';
import { createPublicClient, http, parseGwei } from 'viem';
import { arbitrumSepolia, sepolia } from 'viem/chains';

import { createRollupGetRetryablesFees } from './createRollupGetRetryablesFees';

const arbitrumSepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
});

it('successfully fetches retryable fees for an eth-based chain', async () => {
  const fees = await createRollupGetRetryablesFees(arbitrumSepoliaClient, {
    account: '0x41C966f99De0cA6F6531fbcAc9Db7eaBDF119744',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
});

it('successfully fetches retryable fees for a custom gas token chain', async () => {
  const fees = await createRollupGetRetryablesFees(arbitrumSepoliaClient, {
    account: '0x41C966f99De0cA6F6531fbcAc9Db7eaBDF119744',
    nativeToken: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    maxFeePerGasForRetryables: parseGwei('0.1'),
  });

  expect(fees).toBeTypeOf('bigint');
});
