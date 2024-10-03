import { Address, PublicClient, Transport, Chain } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';
import { createRollupGetRetryablesFeesWithDefaults } from './createRollupGetRetryablesFees';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams<TChain extends Chain | undefined> =
  Prettify<
    WithRollupCreatorAddressOverride<{
      nativeToken: Address;
      maxFeePerGasForRetryables?: bigint;
      account: Address;
      publicClient: PublicClient<Transport, TChain>;
    }>
  >;

export async function createRollupEnoughCustomFeeTokenAllowance<TChain extends Chain | undefined>({
  nativeToken,
  maxFeePerGasForRetryables,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams<TChain>) {
  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    publicClient,
  });

  const fees = await createRollupGetRetryablesFeesWithDefaults(publicClient, {
    account,
    nativeToken,
    maxFeePerGasForRetryables,
  });

  return allowance >= fees;
}
