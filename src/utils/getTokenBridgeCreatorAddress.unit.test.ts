import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import { getTokenBridgeCreatorAddress } from './getTokenBridgeCreatorAddress';
import { registerCustomParentChain } from '../chains';
import { createExampleCustomParentChain } from '../customChainsTestHelpers';

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
    chain: createExampleCustomParentChain({ id: 123 }),
    transport: http(),
  });

  expect(() => getTokenBridgeCreatorAddress(client)).toThrowError(
    'Parent chain not supported: 123',
  );
});

it(`successfully returns address for a registered custom parent chain`, () => {
  const chain = createExampleCustomParentChain({
    id: 123_456,
  });

  registerCustomParentChain(chain);

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  expect(getTokenBridgeCreatorAddress(client)).toEqual(chain.contracts.tokenBridgeCreator.address);
});
