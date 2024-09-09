import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import { getTokenBridgeCreatorAddress } from './getTokenBridgeCreatorAddress';
import { CustomParentChain, registerCustomParentChain } from '../customChains';
import { createCustomChain } from '../customChainsTestHelpers';

it(`successfully returns address for Sepolia`, () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  expect(getTokenBridgeCreatorAddress(client)).toEqual(
    '0x7edb2dfBeEf9417e0454A80c51EE0C034e45a570',
  );
});

it(`fails to return address for an unrecognized parent chain`, () => {
  const client = createPublicClient({
    chain: createCustomChain({ id: 123 }),
    transport: http(),
  });

  expect(() => getTokenBridgeCreatorAddress(client)).toThrowError(
    'Parent chain not supported: 123',
  );
});

it(`successfully returns address for a registered custom parent chain`, () => {
  const rollupCreator = '0x1000000000000000000000000000000000000000';
  const tokenBridgeCreator = '0x2000000000000000000000000000000000000000';

  const chain: CustomParentChain = {
    ...createCustomChain({ id: 123 }),
    contracts: {
      rollupCreator: { address: rollupCreator },
      tokenBridgeCreator: { address: tokenBridgeCreator },
    },
  };

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  registerCustomParentChain(chain);

  expect(getTokenBridgeCreatorAddress(client)).toEqual(tokenBridgeCreator);
});
