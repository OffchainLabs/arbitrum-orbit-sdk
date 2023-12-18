import { it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { arbitrumLocal } from './testHelpers';
import { arbOwnerReadContract } from './arbOwnerReadContract';

const client = createPublicClient({
  chain: arbitrumLocal,
  transport: http(),
});

it('correctly fetches network fee account for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(client, {
    functionName: 'getNetworkFeeAccount',
  });

  expect(result).toEqual('0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E');
});

it('correctly fetches chain owners for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(client, {
    functionName: 'getAllChainOwners',
  });

  expect(result).toHaveLength(1);
  expect(result[0]).toEqual('0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E');
});

it('correctly checks invalid chain owner for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(client, {
    functionName: 'isChainOwner',
    args: ['0x31421C442c422BD16aef6ae44D3b11F404eeaBd9'],
  });

  expect(result).toEqual(false);
});

it('correctly checks valid chain owner for arbitrum sepolia', async () => {
  const result = await arbOwnerReadContract(client, {
    functionName: 'isChainOwner',
    args: ['0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E'],
  });

  expect(result).toEqual(true);
});
