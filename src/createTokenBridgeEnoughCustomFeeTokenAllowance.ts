import { Address, PublicClient } from 'viem';

import { tokenBridgeCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
import { createTokenBridgeDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';

export type CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    nativeToken: Address;
    owner: Address;
    publicClient: PublicClient;
  }>
>;

export async function createTokenBridgeEnoughCustomFeeTokenAllowance({
  nativeToken,
  owner,
  publicClient,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const allowance = await fetchAllowance({
    address: nativeToken,
    owner,
    spender: tokenBridgeCreatorAddressOverride ?? tokenBridgeCreator.address[chainId],
    publicClient,
  });

  return allowance >= createTokenBridgeDefaultRetryablesFees;
}
