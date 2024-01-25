import { Address, PublicClient } from 'viem';

import { tokenBridgeCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
import { tokenBridgeDeploymentEstimatedFees } from './constants';

export type CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams = {
  nativeToken: Address;
  account: Address;
  publicClient: PublicClient;
};

export async function createTokenBridgeEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
}: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: tokenBridgeCreator.address[chainId],
    publicClient,
  });

  return allowance >= tokenBridgeDeploymentEstimatedFees;
}
