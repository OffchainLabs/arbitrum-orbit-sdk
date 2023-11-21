import { Address, PublicClient } from 'viem';

import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
import { deterministicFactoriesDeploymentEstimatedFees } from './constants';

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
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: rollupCreator.address[chainId],
    publicClient,
  });

  return allowance >= deterministicFactoriesDeploymentEstimatedFees;
}
