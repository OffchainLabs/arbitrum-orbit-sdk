import { Address, maxInt256 } from 'viem';

import { OrbitClient } from './orbitClient';
import { approvePrepareTransactionRequest } from './utils/erc20';

export type CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams = {
  amount?: bigint;
  nativeToken: Address;
  account: Address;
  orbitClient: OrbitClient;
};

export async function createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
  amount = maxInt256,
  nativeToken,
  account,
  orbitClient,
}: CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams) {
  const chainId = orbitClient.getValidChainId();
  const spender = orbitClient.getRollupCreatorAddress();

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner: account,
    spender,
    amount,
    publicClient: orbitClient,
  });

  return { ...request, chainId };
}
