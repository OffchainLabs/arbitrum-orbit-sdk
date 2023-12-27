import { Address, maxInt256 } from 'viem';

import { OrbitClient } from './orbitClient';
import { approvePrepareTransactionRequest } from './utils/erc20';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams = {
  amount?: bigint;
  nativeToken: Address;
  account: Address;
  publicClient: OrbitClient;
};

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
  amount = maxInt256,
  nativeToken,
  account,
  publicClient,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams) {
  const chainId = publicClient.getValidChainId();
  const spender = publicClient.getRollupCreatorAddress();

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender,
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
