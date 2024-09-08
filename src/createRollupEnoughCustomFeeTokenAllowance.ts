import { Address, PublicClient, Transport, Chain } from 'viem';

import { fetchAllowance } from './utils/erc20';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { createRollupDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';

export type CreateRollupEnoughCustomFeeTokenAllowanceParams<TChain extends Chain | undefined> =
  Prettify<
    WithRollupCreatorAddressOverride<{
      nativeToken: Address;
      account: Address;
      publicClient: PublicClient<Transport, TChain>;
    }>
  >;

export async function createRollupEnoughCustomFeeTokenAllowance<TChain extends Chain | undefined>({
  nativeToken,
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

  return allowance >= createRollupDefaultRetryablesFees;
}
