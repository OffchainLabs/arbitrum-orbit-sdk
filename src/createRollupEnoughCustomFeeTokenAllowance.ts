import { Address, PublicClient } from 'viem';

import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { fetchAllowance } from './utils/erc20';
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

export async function createRollupEnoughCustomFeeTokenAllowance({
  nativeToken,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupEnoughCustomFeeTokenAllowanceParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const allowance = await fetchAllowance({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? rollupCreator.address[chainId],
    publicClient,
  });

  return allowance >= createRollupDefaultRetryablesFees;
}
