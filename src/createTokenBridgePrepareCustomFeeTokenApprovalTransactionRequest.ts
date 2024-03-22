import { Address, PublicClient, maxInt256 } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';

import { Prettify } from './types/utils';
import { validateParentChain } from './types/ParentChain';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';
import { getTokenBridgeCreatorAddress } from './utils/getters';

export type CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams = Prettify<
  WithTokenBridgeCreatorAddressOverride<{
    amount?: bigint;
    nativeToken: Address;
    owner: Address;
    publicClient: PublicClient;
  }>
>;

export async function createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest({
  amount = maxInt256,
  nativeToken,
  owner,
  publicClient,
  tokenBridgeCreatorAddressOverride,
}: CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams) {
  const chainId = validateParentChain(publicClient);

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner,
    spender: tokenBridgeCreatorAddressOverride ?? getTokenBridgeCreatorAddress(publicClient),
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
