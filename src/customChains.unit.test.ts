import { describe, it, expect } from 'vitest';

import { validateParentChain } from './types/ParentChain';
import { registerCustomParentChain } from './chains';
import { createExampleCustomParentChain } from './customChainsTestHelpers';

describe(`validateParentChain`, () => {
  it(`throws for an unregistered custom parent chain`, () => {
    const id = 456_789;

    expect(() => validateParentChain(id)).toThrowError(`Parent chain not supported: ${id}`);
  });

  it(`works for a registered custom parent chain`, () => {
    const id = 123_456;

    const chain = createExampleCustomParentChain({
      id,
    });

    registerCustomParentChain(chain);

    const result = validateParentChain(id);

    expect(result.chainId).toEqual(id);
    expect(result.isCustom).toEqual(true);
  });
});
