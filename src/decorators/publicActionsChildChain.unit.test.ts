import { it, expect, describe } from 'vitest';

import { createPublicClient, http, zeroAddress } from 'viem';
import { publicActionsChildChain } from './publicActionsChildChain';
import { arbitrum } from 'viem/chains';
import { xai } from '../chains';

const client = createPublicClient({
  chain: arbitrum,
  transport: http(),
}).extend(publicActionsChildChain());

describe('Getters', () => {
  it('[getAllChainOwners] Should return all chain owners', async () => {
    const allChainOwners = await client.getAllChainOwners();
    expect(allChainOwners).toMatchSnapshot();
  });

  it('[getInfraFeeAccount] Should return infra fee account', async () => {
    const infraFeeAccount = await client.getInfraFeeAccount();
    expect(infraFeeAccount).toMatchSnapshot();
  });

  it('[getNetworkFeeAccount] Should return network fee account', async () => {
    const networkFeeAccount = await client.getNetworkFeeAccount();
    expect(networkFeeAccount).toMatchSnapshot();
  });

  it('[getScheduledUpgrade] Should return scheduled upgrade', async () => {
    const scheduledUpgrade = await client.getScheduledUpgrade();
    expect(scheduledUpgrade).toMatchSnapshot();
  });

  it('[isChainOwner] Should return if an address is a chain owner', async () => {
    const xaiClient = createPublicClient({
      chain: xai,
      transport: http(),
    }).extend(publicActionsChildChain());
    const isZeroAddressChainOwner = await xaiClient.isChainOwner({ address: zeroAddress });
    expect(isZeroAddressChainOwner).toBeFalsy();
    const allChainOwners = await xaiClient.getAllChainOwners();
    const isChainOwner = await xaiClient.isChainOwner({
      address: allChainOwners[0],
    });
    expect(isChainOwner).toBeTruthy();
  });

  it('[getGasAccountingParams] Should return gas accounting params', async () => {
    const gasAccountingParams = await client.getGasAccountingParams();
    expect(gasAccountingParams).toMatchSnapshot();
  });

  it('[getMinimumGasPrice] Should return minimum gas price', async () => {
    const minimumGasPrice = await client.getMinimumGasPrice();
    expect(minimumGasPrice).toMatchSnapshot();
  });

  it('[getParentBaseFeeEstimate] Should return parent base fee estimate', async () => {
    const parentBaseFeeEstimate = await client.getParentBaseFeeEstimate();
    expect(parentBaseFeeEstimate).toBeGreaterThan(0n);
  });

  it('[getParentRewardRate] Should return parent reward rate', async () => {
    const parentRewardRate = await client.getParentRewardRate();
    expect(parentRewardRate).toMatchSnapshot();
  });

  it('[getParentRewardRecipient] Should return parent reward recipient', async () => {
    const parentRewardRecipient = await client.getParentRewardRecipient();
    expect(parentRewardRecipient).toMatchSnapshot();
  });
});
