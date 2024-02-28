import { Address, PublicClient } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validParentChainId } from './types/ParentChain';
import { rollupCreator } from './contracts';
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
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreatorAddressOverride ?? rollupCreator.address[chainId],
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
