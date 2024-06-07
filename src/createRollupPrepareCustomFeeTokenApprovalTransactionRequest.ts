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
 * Prepares the transaction request for approving the custom fee token for the rollup creator.
 *
 * @param {CreateRollupPrepareCustomFeeTokenApprovalTransactionRequestParams} params - The parameters for the approval transaction request
 * @param {bigint} [params.amount=createRollupDefaultRetryablesFees] - The amount of tokens to approve, defaults to createRollupDefaultRetryablesFees
 * @param {Address} params.nativeToken - The address of the native token
 * @param {Address} params.account - The address of the account
 * @param {PublicClient} params.publicClient - The public client instance
 * @param {Address} [params.rollupCreatorAddressOverride] - Optional address to override the rollup creator address
 *
 * @returns {Promise<Object>} The transaction request object with chainId
 *
 * @example
 * const approvalRequest = await createRollupPrepareCustomFeeTokenApprovalTransactionRequest({
 *   amount: BigInt(1000),
 *   nativeToken: '0x1234...abcd',
 *   account: '0xabcd...1234',
 *   publicClient,
 * });
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
