import { Address } from 'viem';

import { validateParentChain } from './types/ParentChain';
import { SetValidKeysetParams } from './setValidKeyset';
import { setValidKeysetEncodeFunctionData } from './setValidKeysetEncodeFunctionData';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';

export type SetValidKeysetPrepareTransactionRequestParams = Omit<
  SetValidKeysetParams,
  'walletClient'
> & {
  account: Address;
};

/**
 * Sets up a transaction request to upgrade the executor with a valid keyset.
 * This function prepares the transaction request by encoding the necessary
 * function data and validating the parent chain. It returns the prepared
 * transaction request along with the chain ID.
 *
 * @param {Object} setValidKeysetPrepareTransactionRequestParams - Parameters for preparing the transaction request
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.coreContracts - Core contracts involved in the transaction
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.keyset - The keyset to be validated
 * @param {string} setValidKeysetPrepareTransactionRequestParams.account - The account address initiating the transaction
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.publicClient - The public client used for the transaction
 *
 * @returns {Promise<Object>} - The prepared transaction request along with the chain ID
 *
 * @example
 * const txRequest = await setValidKeysetPrepareTransactionRequest({
 *   coreContracts: {
 *     upgradeExecutor: '0x...',
 *     sequencerInbox: '0x...',
 *   },
 *   keyset: {
 *     keys: ['0x...'],
 *     threshold: 1,
 *   },
 *   account: '0x...',
 *   publicClient,
 * });
 */
export async function setValidKeysetPrepareTransactionRequest({
  coreContracts,
  keyset,
  account,
  publicClient,
}: SetValidKeysetPrepareTransactionRequestParams) {
  const chainId = validateParentChain(publicClient);

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: coreContracts.upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        coreContracts.sequencerInbox, // target
        setValidKeysetEncodeFunctionData(keyset), // targetCallData
      ],
    }),
    account,
  });

  return { ...request, chainId };
}
