import { describe, it, expect } from 'vitest';
import { getNitroTestnodePrivateKeyAccounts } from '../testHelpers';
import { createPublicClient, http } from 'viem';
import { nitroTestnodeL3 } from '../chains';
import { getGasAccountingParams } from './getGasAccountingParams';
import { getMinimumGasPrice } from './getMinimumGasPrice';
import { getParentBaseFeeEstimate } from './getParentBaseFeeEstimate';
import { getParentRewardRate } from './getParentRewardRate';
import { getParentRewardRecipient } from './getParentRewardRecipient';

const client = createPublicClient({
  chain: nitroTestnodeL3,
  transport: http(),
});

const testnodeAccounts = getNitroTestnodePrivateKeyAccounts();
const l3RollupOwner = testnodeAccounts.l3RollupOwner;

describe('ArbGasInfo Getters', () => {
  it('getGasAccountingParams successfully fetches gas accounting parameters', async () => {
    const result = await getGasAccountingParams(client);
    expect(result).toMatchInlineSnapshot(`
      {
        "gasPoolMax": 32000000n,
        "maxTxGasLimit": 32000000n,
        "speedLimitPerSecond": 7000000n,
      }
    `);
  });
  it('getMinimumGasPrice successfully fetches minimum gas price', async () => {
    const result = await getMinimumGasPrice(client);
    expect(result).toMatchInlineSnapshot(`100000000n`);
  });
  it('getParentBaseFeeEstimate successfully fetches parent base fee estimate', async () => {
    const result = await getParentBaseFeeEstimate(client);
    expect(Number(result)).gte(0);
  });
  it('getParentRewardRate successfully fetches parent reward rate', async () => {
    const result = await getParentRewardRate(client);
    expect(result).toMatchInlineSnapshot(`10n`);
  });
  it('getParentRewardRecipient successfully fetches parent reward recipient', async () => {
    const result = await getParentRewardRecipient(client);
    expect(result).toEqual(l3RollupOwner.address);
  });
});
