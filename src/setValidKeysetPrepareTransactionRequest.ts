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
 * Prepares a transaction request for setting a valid keyset.
 *
 * @param {Object} setValidKeysetPrepareTransactionRequestParams - Parameters for preparing the transaction request
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.coreContracts - The core contracts involved
 * @param {string} setValidKeysetPrepareTransactionRequestParams.coreContracts.upgradeExecutor - The address of the upgrade executor contract
 * @param {string} setValidKeysetPrepareTransactionRequestParams.coreContracts.sequencerInbox - The address of the sequencer inbox contract
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.keyset - The keyset to be set as valid
 * @param {Array<string>} setValidKeysetPrepareTransactionRequestParams.keyset.keys - Array of keys in the keyset
 * @param {number} setValidKeysetPrepareTransactionRequestParams.keyset.threshold - The threshold number of keys required
 * @param {Address} setValidKeysetPrepareTransactionRequestParams.account - The account address initiating the transaction
 * @param {Object} setValidKeysetPrepareTransactionRequestParams.publicClient - The public client to interact with the blockchain
 *
 * @returns {Promise<Object>} The prepared transaction request with chain ID
 *
 * @example
 * const transactionRequest = await setValidKeysetPrepareTransactionRequest({
 *   coreContracts: { upgradeExecutor: '0x...', sequencerInbox: '0x...' },
 *   keyset: { keys: ['0x...'], threshold: 1 },
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
