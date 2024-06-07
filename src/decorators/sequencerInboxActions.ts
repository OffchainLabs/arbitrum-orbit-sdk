import { Transport, Chain, PrepareTransactionRequestReturnType, PublicClient, Address } from 'viem';

import {
  sequencerInboxReadContract,
  SequencerInboxReadContractParameters,
  SequencerInboxReadContractReturnType,
} from '../sequencerInboxReadContract';
import {
  SequencerInboxFunctionName,
  sequencerInboxPrepareTransactionRequest,
  SequencerInboxPrepareTransactionRequestParameters,
} from '../sequencerInboxPrepareTransactionRequest';

/**
 * Parameters for performing an action on the Sequencer Inbox.
 */
type SequencerInboxActionParams = {
  /**
   * The public client to interact with the blockchain.
   */
  publicClient: PublicClient;
  /**
   * The address of the Sequencer Inbox contract.
   */
  contractAddress: Address;
  /**
   * The name of the function to call on the Sequencer Inbox contract.
   */
  functionName: SequencerInboxFunctionName;
  /**
   * Additional parameters for reading from the Sequencer Inbox contract.
   */
  readParams?: SequencerInboxReadContractParameters;
  /**
   * Additional parameters for preparing a transaction request to the Sequencer Inbox contract.
   */
  prepareTxRequestParams?: SequencerInboxPrepareTransactionRequestParameters;
};

/**
 * Results from performing an action on the Sequencer Inbox.
 */
type SequencerInboxActionResults = {
  /**
   * The result of reading from the Sequencer Inbox contract.
   */
  readResult?: SequencerInboxReadContractReturnType;
  /**
   * The result of preparing a transaction request to the Sequencer Inbox contract.
   */
  prepareTxRequestResult?: PrepareTransactionRequestReturnType;
};

/**
 * Performs an action on the Sequencer Inbox contract.
 *
 * Depending on the provided parameters, this function can either read from the
 * Sequencer Inbox contract or prepare a transaction request to the contract.
 *
 * @param {SequencerInboxActionParams} params - The parameters for the action.
 * @param {PublicClient} params.publicClient - The public client to interact with the blockchain.
 * @param {Address} params.contractAddress - The address of the Sequencer Inbox contract.
 * @param {SequencerInboxFunctionName} params.functionName - The name of the function to call on the Sequencer Inbox contract.
 * @param {SequencerInboxReadContractParameters} [params.readParams] - Additional parameters for reading from the Sequencer Inbox contract.
 * @param {SequencerInboxPrepareTransactionRequestParameters} [params.prepareTxRequestParams] - Additional parameters for preparing a transaction request to the Sequencer Inbox contract.
 *
 * @returns {Promise<SequencerInboxActionResults>} The results from performing the action.
 *
 * @example
 * const results = await performSequencerInboxAction({
 *   publicClient,
 *   contractAddress: '0xYourContractAddress',
 *   functionName: 'yourFunctionName',
 *   readParams: { param1: 'value1' },
 * });
 *
 * console.log(results.readResult);
 */
export async function performSequencerInboxAction(
  params: SequencerInboxActionParams,
): Promise<SequencerInboxActionResults> {
  const { publicClient, contractAddress, functionName, readParams, prepareTxRequestParams } = params;

  const results: SequencerInboxActionResults = {};

  if (readParams) {
    results.readResult = await sequencerInboxReadContract({
      publicClient,
      contractAddress,
      functionName,
      ...readParams,
    });
  }

  if (prepareTxRequestParams) {
    results.prepareTxRequestResult = await sequencerInboxPrepareTransactionRequest({
      publicClient,
      contractAddress,
      functionName,
      ...prepareTxRequestParams,
    });
  }

  return results;
}
