import { it, expect } from 'vitest';

import { chains } from './chains';
import { ParentChainId } from './types/ParentChain';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';

it('returns default value for confirmPeriodBlocks based on parent chain', () => {
  expect(
    chains
      .filter((chain) => chain.id !== 333333)
      .reduce((acc, value) => {
        return {
          ...acc,
          // it's ok to cast as we've filtered out 333333 above
          [value.id]: getDefaultConfirmPeriodBlocks(value.id as ParentChainId),
        };
      }, {}),
  ).toMatchSnapshot();
});
