import { describe, it, expect } from 'vitest';

import { validateParentChain } from './types/ParentChain';
import { registerCustomParentChain } from './chains';
import { generateChainId } from './utils';

import { testHelper_createCustomParentChain } from './customChainsTestHelpers';

describe(`validateParentChain`, () => {
  it(`throws for an unregistered custom parent chain`, () => {
    const id = generateChainId();

    expect(() => validateParentChain(id)).toThrowError(`Parent chain not supported: ${id}`);
  });

  it(`works for a registered custom parent chain`, () => {
    const chain = testHelper_createCustomParentChain();

    registerCustomParentChain(chain);

    const result = validateParentChain(chain.id);

    expect(result.chainId).toEqual(chain.id);
    expect(result.isCustom).toEqual(true);
  });
});
