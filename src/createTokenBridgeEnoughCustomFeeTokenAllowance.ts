import { Address, PublicClient } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { createTokenBridgeDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { getTokenBridgeCreatorAddress } from './utils/getters';

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
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner,
    spender: tokenBridgeCreatorAddressOverride ?? getTokenBridgeCreatorAddress(publicClient),
    publicClient,
  });

  return allowance >= createTokenBridgeDefaultRetryablesFees;
}
