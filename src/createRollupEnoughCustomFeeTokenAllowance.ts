import { Address, PublicClient } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { getRollupCreatorAddress } from './utils/getters';
import { createRollupDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams = Prettify<
  WithRollupCreatorAddressOverride<{
    nativeToken: Address;
    account: Address;
    publicClient: PublicClient;
  }>
>;

/**
 * Checks if the custom gas token allowance granted to the rollup creator is sufficient.
 *
 * @param {CreateRollupEnoughCustomFeeTokenAllowanceParams} params - The parameters for the function.
 * @param {Address} params.nativeToken - The native token address.
 * @param {Address} params.account - The account address.
 * @param {PublicClient} params.publicClient - The public client.
 * @param {Address} [params.rollupCreatorAddressOverride] - Optional override for the rollup creator address.
 *
 * @returns {Promise<boolean>} - Returns true if the allowance is sufficient, false otherwise.
 *
 * @example
 * const isAllowanceSufficient = await createRollupEnoughCustomFeeTokenAllowance({
 *   nativeToken: '0xTokenAddress',
 *   account: '0xAccountAddress',
 *   publicClient,
 * });
 * console.log(`Is allowance sufficient? ${isAllowanceSufficient}`);
 */
export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams): Promise<boolean> {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    publicClient,
  });

  return allowance >= createRollupDefaultRetryablesFees;
}
