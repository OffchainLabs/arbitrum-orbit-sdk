import { Address } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { deterministicFactoriesDeploymentEstimatedFees } from './constants';
import { OrbitClient } from './orbitClient';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams = {
  nativeToken: Address;
  account: Address;
  orbitClient: OrbitClient;
};

export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  orbitClient,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams) {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: orbitClient.getRollupCreatorAddress(),
    publicClient: orbitClient,
  });

  return allowance >= deterministicFactoriesDeploymentEstimatedFees;
}
