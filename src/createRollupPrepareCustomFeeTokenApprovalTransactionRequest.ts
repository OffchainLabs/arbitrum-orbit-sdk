import { Address, PublicClient, maxInt256 } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validParentChainId } from './types/ParentChain';
import { rollupCreator } from './contracts';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams =
  {
    amount?: bigint;
    nativeToken: Address;
    account: Address;
    publicClient: PublicClient;
  };

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
  amount = maxInt256,
  nativeToken,
  account,
  publicClient,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: rollupCreator.address[chainId],
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
