import { Address, PublicClient } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { deterministicFactoriesDeploymentEstimatedFees } from './constants';
import { getRollupCreatorAddress } from './utils/getters';

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
