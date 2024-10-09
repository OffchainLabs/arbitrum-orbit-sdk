import { describe, expect, it } from 'vitest';

import { registerCustomParentChain } from './chains';
import { testHelper_createCustomParentChain } from './testHelpers';

describe('registerCustomParentChain', () => {
  it(`throws if the RollupCreator address wasn't provided`, () => {
    // omit contracts from the chain
    const { contracts, ...chain } = testHelper_createCustomParentChain();

    expect(() => registerCustomParentChain(chain)).toThrowError(
      `"contracts.rollupCreator.address" is missing or invalid for custom parent chain with id ${chain.id}`,
    );
  });

  it(`throws if the TokenBridgeCreator address wasn't provided`, () => {
    // omit contracts from the chain
    const { contracts, ...chain } = testHelper_createCustomParentChain();

    expect(() =>
      registerCustomParentChain({
        ...chain,
        // add in only RollupCreator
        contracts: { rollupCreator: contracts.rollupCreator },
      }),
    ).toThrowError(
      `"contracts.tokenBridgeCreator.address" is missing or invalid for custom parent chain with id ${chain.id}`,
    );
  });
});
