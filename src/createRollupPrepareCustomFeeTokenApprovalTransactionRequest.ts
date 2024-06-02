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

/**
 * Creates a custom fee token approval transaction request for the Rollup chain.
 * The function takes in parameters such as the amount, native token address,
 * account address, and public client. It then validates the parent chain,
 * generates the transaction request, and returns it along with the chain ID.
 *
 * @param {Object} params - The parameters for creating the approval transaction request.
 * @param {bigint} [params.amount=createRollupDefaultRetryablesFees] - The amount of tokens to approve, optional, defaults to createRollupDefaultRetryablesFees.
 * @param {Address} params.nativeToken - The native token address.
 * @param {Address} params.account - The account address.
 * @param {PublicClient} params.publicClient - The public client.
 * @param {Address} [params.rollupCreatorAddressOverride] - Optional override for the rollup creator address.
 *
 * @returns {Promise<Object>} The custom fee token approval transaction request and the chain ID.
 *
 * @example
 * const approvalRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
 *   amount: 1000n,
 *   nativeToken: '0xTokenAddress',
 *   account: '0xAccountAddress',
 *   publicClient,
 * });
 *
 * console.log(approvalRequest);
 */
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
