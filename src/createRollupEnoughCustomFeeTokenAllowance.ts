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
 * Ensures that the specified account has enough custom fee token allowance for
 * creating a rollup transaction. Returns a boolean value indicating whether the
 * allowance is sufficient.
 */
export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams) {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    publicClient,
  });

  return allowance >= createRollupDefaultRetryablesFees;
}
