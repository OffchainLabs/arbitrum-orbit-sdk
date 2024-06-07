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

/**
 * Checks if the custom fee token allowance is enough for creating a token bridge.
 *
 * @param {CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams} params - The parameters for checking token allowance.
 * @param {Address} params.nativeToken - The address of the native token.
 * @param {Address} params.owner - The address of the token owner.
 * @param {PublicClient} params.publicClient - The public client.
 * @param {Address} [params.tokenBridgeCreatorAddressOverride] - Optional override for the token bridge creator address.
 *
 * @returns {Promise<boolean>} - Returns true if the allowance is enough, otherwise false.
 *
 * @example
 * const isEnough = await createTokenBridgeEnoughCustomFeeTokenAllowance({
 *   nativeToken: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   publicClient,
 * });
 * console.log(isEnough); // true or false
 */
export async function createTokenBridgeEnoughCustomFeeTokenAllowance({
  nativeToken,
  owner,
  publicClient,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams): Promise<boolean> {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner,
    spender: tokenBridgeCreatorAddressOverride ?? getTokenBridgeCreatorAddress(publicClient),
    publicClient,
  });

  return allowance >= createTokenBridgeDefaultRetryablesFees;
}
