import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import { getRollupCreatorAddress } from './getRollupCreatorAddress';
import { CustomParentChain, registerCustomParentChain } from '../customChains';
import { createCustomChain } from '../customChainsTestHelpers';

it(`successfully returns address for Sepolia`, () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  expect(getRollupCreatorAddress(client)).toEqual('0xfb774eA8A92ae528A596c8D90CBCF1bdBC4Cee79');
});

it(`fails to return address for an unrecognized parent chain`, () => {
  const client = createPublicClient({
    chain: createCustomChain({ id: 123 }),
    transport: http(),
  });

  expect(() => getRollupCreatorAddress(client)).toThrowError('Parent chain not supported: 123');
});

it(`successfully returns address for a registered custom parent chain`, () => {
  const rollupCreator = '0x1000000000000000000000000000000000000000';
  const tokenBridgeCreator = '0x2000000000000000000000000000000000000000';

  const chain: CustomParentChain = {
    ...createCustomChain({ id: 123_456 }),
    contracts: {
      rollupCreator: { address: rollupCreator },
      tokenBridgeCreator: { address: tokenBridgeCreator },
    },
  };

  registerCustomParentChain(chain);

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  expect(getRollupCreatorAddress(client)).toEqual(rollupCreator);
});