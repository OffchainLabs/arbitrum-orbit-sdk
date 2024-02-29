import { Address, PublicClient, maxInt256 } from 'viem';

import { approvePrepareTransactionRequest } from './utils/erc20';
import { validParentChainId } from './types/ParentChain';
import { tokenBridgeCreator } from './contracts';

import { Prettify } from './types/utils';
import { WithTokenBridgeCreatorAddressOverride } from './types/createTokenBridgeTypes';

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
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const request = await approvePrepareTransactionRequest({
    address: nativeToken,
    owner,
    spender: tokenBridgeCreatorAddressOverride ?? tokenBridgeCreator.address[chainId],
    amount,
    publicClient,
  });

  return { ...request, chainId };
}
