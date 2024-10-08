import { describe, it, expect } from 'vitest';

import { validateParentChain } from './types/ParentChain';
import { CustomParentChain, registerCustomParentChain } from './customChains';
import { createCustomChain } from './customChainsTestHelpers';

describe(`validateParentChain`, () => {
  it(`throws for an unregistered custom parent chain`, () => {
    const id = 456_789;

    expect(() => validateParentChain(id)).toThrowError(`Parent chain not supported: ${id}`);
  });

  it(`works for a registered custom parent chain`, () => {
    const id = 123_456;

    const chain: CustomParentChain = {
      ...createCustomChain({ id }),
      contracts: {
        rollupCreator: { address: '0x1000000000000000000000000000000000000000' },
        tokenBridgeCreator: { address: '0x2000000000000000000000000000000000000000' },
      },
    };

    registerCustomParentChain(chain);

    const result = validateParentChain(id);

    expect(result.chainId).toEqual(id);
    expect(result.isCustom).toEqual(true);
  });
});
