import { describe, it, expect } from 'vitest';

import { isValidParentChainId } from './types/ParentChain';
import { registerCustomParentChain } from './customChains';

describe(`isValidParentChainId`, () => {
  it(`returns "false" for an unregistered custom parent chain`, () => {
    expect(isValidParentChainId(456_789)).toEqual(false);
  });

  it(`returns "true" for a registered custom parent chain`, () => {
    const chainId = 123_456;

    registerCustomParentChain({ id: chainId });
    expect(isValidParentChainId(chainId)).toEqual(true);
  });
});
