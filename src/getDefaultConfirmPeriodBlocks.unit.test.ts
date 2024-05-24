import { it, expect } from 'vitest';

import { chains } from './chains';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';
import { ParentChainId } from './types/ParentChain';

it('returns default value for confirm period blocks', () => {
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
