import { describe, it, expect } from 'vitest';
import { createPublicClient, http } from 'viem';

import { nitroTestnodeL2, nitroTestnodeL3 } from './chains';
import { getInformationFromTestnode } from './testHelpers';
import { getUpgradeExecutor } from './getUpgradeExecutor';

const { l3UpgradeExecutor, l3Rollup } = getInformationFromTestnode();

// Tests can be enabled once we run one node per integration test
describe('successfully get upgrade executor', () => {
  it('from parent chain', async () => {
    const parentChainClient = createPublicClient({
      chain: nitroTestnodeL2,
      transport: http(),
    });

    const upgradeExecutor = await getUpgradeExecutor(parentChainClient, {
      rollup: l3Rollup,
    });
    expect(upgradeExecutor?.toLowerCase()).toEqual(l3UpgradeExecutor);
  });

  it('from child chain', async () => {
    const childChainClient = createPublicClient({
      chain: nitroTestnodeL3,
      transport: http(),
    });
    const upgradeExecutor = await getUpgradeExecutor(childChainClient);
    expect(upgradeExecutor).toMatchSnapshot();
  });
});
