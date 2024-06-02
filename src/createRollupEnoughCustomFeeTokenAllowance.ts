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
 * Checks if the allowance for a specific native token is enough for creating a rollup with custom fees.
 * 
 * Fetches the allowance using the owner's account and the spender address, which is either provided or fetched
 * from the Rollup creator address. The function returns a boolean indicating whether the allowance is greater than
 * or equal to the default retryable fees required for creating the rollup.
 *
 * @param {CreateRollupEnoughCustomFeeTokenAllowanceParams} params - The parameters for checking the allowance.
 * @param {Address} params.nativeToken - The address of the native token.
 * @param {Address} params.account - The address of the owner's account.
 * @param {PublicClient} params.publicClient - The public client used to interact with the blockchain.
 * @param {Address} [params.rollupCreatorAddressOverride] - Optional override for the Rollup creator address.
 *
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the allowance is sufficient.
 *
 * @example
 * const isAllowanceEnough = await createRollupEnoughCustomFeeTokenAllowance({
 *   nativeToken: '0xTokenAddress',
 *   account: '0xOwnerAddress',
 *   publicClient,
 * });
 * console.log(isAllowanceEnough); // true or false
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
