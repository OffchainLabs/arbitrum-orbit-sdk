import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import { getRollupCreatorAddress } from './getRollupCreatorAddress';
import { registerCustomParentChain } from '../chains';
import { createExampleCustomParentChain } from '../customChainsTestHelpers';

it(`successfully returns address for Sepolia`, () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  expect(getRollupCreatorAddress(client)).toEqual('0xfb774eA8A92ae528A596c8D90CBCF1bdBC4Cee79');
});

it(`fails to return address for an unrecognized parent chain`, () => {
  const client = createPublicClient({
    chain: createExampleCustomParentChain({ id: 123 }),
    transport: http(),
  });

  expect(() => getRollupCreatorAddress(client)).toThrowError('Parent chain not supported: 123');
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

  expect(getRollupCreatorAddress(client)).toEqual(chain.contracts.rollupCreator.address);
});
