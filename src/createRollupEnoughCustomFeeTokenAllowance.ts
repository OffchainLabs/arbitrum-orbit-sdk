import { Address, PublicClient } from 'viem';

import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
import { deterministicFactoriesDeploymentEstimatedFees } from './constants';
import { getRollupCreatorAddress, getValidChainId } from './utils/getters';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams = {
  nativeToken: Address;
  account: Address;
  publicClient: PublicClient;
};

export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams) {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: getRollupCreatorAddress(publicClient),
    publicClient,
  });

  return allowance >= deterministicFactoriesDeploymentEstimatedFees;
}
