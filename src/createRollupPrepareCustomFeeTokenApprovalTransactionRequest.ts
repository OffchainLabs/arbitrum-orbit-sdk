import { Address, PublicClient, maxInt256 } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validateParentChainId } from './types/ParentChain';
import { getRollupCreatorAddress } from './utils/getters';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams = {
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
  const chainId = validateParentChainId(publicClient);
  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender: getRollupCreatorAddress(publicClient),
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
