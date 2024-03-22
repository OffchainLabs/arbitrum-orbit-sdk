import { Address, PublicClient } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validateParentChain } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getters';
import { createRollupDefaultRetryablesFees } from './constants';

import { Prettify } from './types/utils';
import { WithRollupCreatorAddressOverride } from './types/createRollupTypes';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams = Prettify<
  WithRollupCreatorAddressOverride<{
    amount?: bigint;
    nativeToken: Address;
    account: Address;
    publicClient: PublicClient;
  }>
>;

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
  amount = createRollupDefaultRetryablesFees,
  nativeToken,
  account,
  publicClient,
  rollupCreatorAddressOverride,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams) {
  const chainId = validateParentChain(publicClient);

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
