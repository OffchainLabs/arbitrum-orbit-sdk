import { createPublicClient, http, zeroAddress } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { describe, it, expect } from 'vitest';

import { arbOwner } from './contracts';
import { createArbOwnerClient } from './arbOwnerClient';

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

describe('with upgrade executor', () => {
  const arbOwnerClient = createArbOwnerClient({
    publicClient,
    upgradeExecutor: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
  });

  it('prepareFunctionData', () => {
    const result = arbOwnerClient.prepareFunctionData({
      functionName: 'addChainOwner',
      args: ['0x31421C442c422BD16aef6ae44D3b11F404eeaBd9'],
    });

    expect(result.to).toEqual('0xd8da6bf26964af9d7eed9e03e53415d37aa96045');
    expect(result.data).toEqual(
      '0xbca8c7b5000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000024481f8dbf00000000000000000000000031421c442c422bd16aef6ae44d3b11f404eeabd900000000000000000000000000000000000000000000000000000000'
    );
    expect(result.value).toEqual(BigInt(0));
  });
});

describe('without upgrade executor', () => {
  const arbOwnerClient = createArbOwnerClient({
    publicClient,
    upgradeExecutor: false,
  });

  it('prepareFunctionData', () => {
    const result = arbOwnerClient.prepareFunctionData({
      functionName: 'addChainOwner',
      args: ['0x31421C442c422BD16aef6ae44D3b11F404eeaBd9'],
    });

    expect(result.to).toEqual(arbOwner.address);
    expect(result.data).toEqual(
      '0x481f8dbf00000000000000000000000031421c442c422bd16aef6ae44d3b11f404eeabd9'
    );
    expect(result.value).toEqual(BigInt(0));
  });
});
