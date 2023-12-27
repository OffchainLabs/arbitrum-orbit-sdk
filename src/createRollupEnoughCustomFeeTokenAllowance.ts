import { Address } from 'viem';

import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
import { deterministicFactoriesDeploymentEstimatedFees } from './constants';
import { OrbitClient } from './orbitClient';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams = {
  nativeToken: Address;
  account: Address;
  publicClient: OrbitClient;
};

export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: publicClient.getRollupCreatorAddress(),
    publicClient,
  });

  return allowance >= deterministicFactoriesDeploymentEstimatedFees;
}
