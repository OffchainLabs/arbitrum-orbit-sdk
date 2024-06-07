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

/**
 * Prepares a transaction request to approve a custom fee token for the token bridge.
 *
 * @param {CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams} params - The parameters for the approval transaction.
 * @param {bigint} [params.amount=maxInt256] - The amount of tokens to approve. Defaults to maxInt256.
 * @param {Address} params.nativeToken - The address of the native token.
 * @param {Address} params.owner - The address of the token owner.
 * @param {PublicClient} params.publicClient - The public client to interact with the blockchain.
 * @param {Address} [params.tokenBridgeCreatorAddressOverride] - Optional override for the token bridge creator address.
 *
 * @returns {Promise<Object>} The prepared transaction request along with the chain ID.
 *
 * @example
 * const approvalRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest({
 *   nativeToken: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   publicClient,
 * });
 * console.log(approvalRequest);
 */
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
