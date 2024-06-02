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
 * Creates a token bridge with enough custom fee token allowance.
 *
 * This function fetches the allowance for a native token owned by a specified address,
 * compares it to the default retryable fees for creating a token bridge, and
 * returns a boolean indicating if the allowance is sufficient.
 *
 * @param {CreateTokenBridgeEnoughCustomFeeTokenAllowanceParams} params - The parameters for checking token allowance
 * @param {Address} params.nativeToken - The native token address
 * @param {Address} params.owner - The owner address
 * @param {PublicClient} params.publicClient - The public client
 * @param {Address} [params.tokenBridgeCreatorAddressOverride] - Optional override for the token bridge creator address
 *
 * @returns {Promise<boolean>} - Returns true if the allowance is sufficient, otherwise false
 *
 * @example
 * const isAllowanceSufficient = await createTokenBridgeEnoughCustomFeeTokenAllowance({
 *   nativeToken: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   publicClient,
 * });
 * console.log(isAllowanceSufficient);
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
