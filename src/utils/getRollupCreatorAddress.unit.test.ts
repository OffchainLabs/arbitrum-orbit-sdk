import { expect, it } from 'vitest';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

import { getRollupCreatorAddress } from './getRollupCreatorAddress';
import { registerCustomParentChain } from '../chains';

import { testHelper_createCustomParentChain } from '../testHelpers';

it(`successfully returns address for Sepolia`, () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  expect(getRollupCreatorAddress(client)).toEqual('0x57A8aBED71b14dBa84b5d400A4227Ff4B4f31EB5');
});

it(`fails to return address for an unrecognized parent chain`, () => {
  const chain = testHelper_createCustomParentChain();

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  expect(() => getRollupCreatorAddress(client)).toThrowError(
    `Parent chain not supported: ${chain.id}`,
  );
});

it(`successfully returns address for a registered custom parent chain`, () => {
  const chain = testHelper_createCustomParentChain();

  registerCustomParentChain(chain);

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  expect(getRollupCreatorAddress(client)).toEqual(chain.contracts.rollupCreator.address);
});
