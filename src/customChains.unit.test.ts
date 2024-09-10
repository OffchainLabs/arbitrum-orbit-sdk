import { describe, it, expect } from 'vitest';

import { isValidParentChainId } from './types/ParentChain';
import { CustomParentChain, registerCustomParentChain } from './customChains';
import { createCustomChain } from './customChainsTestHelpers';

describe(`isValidParentChainId`, () => {
  it(`returns "false" for an unregistered custom parent chain`, () => {
    expect(isValidParentChainId(456_789)).toEqual(false);
  });

  it(`returns "true" for a registered custom parent chain`, () => {
    const chainId = 123_456;

    const chain: CustomParentChain = {
      ...createCustomChain({ id: chainId }),
      contracts: {
        rollupCreator: { address: '0x1000000000000000000000000000000000000000' },
        tokenBridgeCreator: { address: '0x2000000000000000000000000000000000000000' },
      },
    };

    registerCustomParentChain(chain);

    expect(isValidParentChainId(chainId)).toEqual(true);
  });
});
