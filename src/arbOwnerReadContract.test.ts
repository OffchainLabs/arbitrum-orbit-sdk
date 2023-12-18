import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

import { arbOwnerReadContract } from './arbOwnerReadContract';

const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

it('correctly fetches network fee account for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(arbitrumSepoliaClient, {
    functionName: 'getNetworkFeeAccount',
  });

  expect(result).toEqual('0x71B61c2E250AFa05dFc36304D6c91501bE0965D8');
});

it('correctly fetches chain owners for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(arbitrumSepoliaClient, {
    functionName: 'getAllChainOwners',
  });

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual('0x71B61c2E250AFa05dFc36304D6c91501bE0965D8');
});

it('correctly checks invalid chain owner for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(arbitrumSepoliaClient, {
    functionName: 'isChainOwner',
    args: ['0x31421C442c422BD16aef6ae44D3b11F404eeaBd9'],
  });

  expect(result).toEqual(false);
});

it('correctly checks valid chain owner for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(arbitrumSepoliaClient, {
    functionName: 'isChainOwner',
    args: ['0x71B61c2E250AFa05dFc36304D6c91501bE0965D8'],
  });

  expect(result).toEqual(true);
});
