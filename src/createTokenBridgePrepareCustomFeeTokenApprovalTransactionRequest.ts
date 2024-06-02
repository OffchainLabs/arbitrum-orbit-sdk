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
 * Creates a Token Bridge prepare custom fee token approval transaction request
 * with specified parameters. This function returns a {@link Request} object
 * containing the approval transaction details.
 *
 * @param {CreateTokenBridgePrepareCustomFeeTokenApprovalTransactionRequestParams} params - The parameters for the approval transaction request
 * @param {bigint} [params.amount=maxInt256] - The amount to approve, optional, defaults to maxInt256
 * @param {Address} params.nativeToken - The native token address
 * @param {Address} params.owner - The owner address
 * @param {PublicClient} params.publicClient - The public client instance
 * @param {Address} [params.tokenBridgeCreatorAddressOverride] - Optional token bridge creator address override
 *
 * @returns {Promise<Object>} The approval transaction request details including chainId
 *
 * @example
 * const approvalRequest = await createTokenBridgePrepareCustomFeeTokenApprovalTransactionRequest({
 *   amount: BigInt(1000),
 *   nativeToken: '0xTokenAddress',
 *   owner: '0xOwnerAddress',
 *   publicClient,
 * });
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
