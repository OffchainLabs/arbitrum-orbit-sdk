import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Transport,
  Chain,
} from 'viem';

import { sequencerInbox } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutorEncodeFunctionData';
import { GetFunctionName } from './types/utils';
import { validateParentChainPublicClient } from './types/ParentChain';

export type SequencerInboxAbi = typeof sequencerInbox.abi;
export type SequencerInboxFunctionName = GetFunctionName<SequencerInboxAbi>;

/**
 * Parameters for encoding function data for the Sequencer Inbox contract.
 *
 * @typedef {Object} SequencerInboxEncodeFunctionDataParameters
 * @property {SequencerInboxAbi} abi - The ABI of the Sequencer Inbox contract.
 * @property {SequencerInboxFunctionName} functionName - The name of the function to encode.
 * @property {Array<any>} args - The arguments for the function.
 */
type SequencerInboxEncodeFunctionDataParameters<TFunctionName extends SequencerInboxFunctionName> =
  EncodeFunctionDataParameters<SequencerInboxAbi, TFunctionName>;

/**
 * Encodes function data for the Sequencer Inbox contract.
 *
 * @param {SequencerInboxEncodeFunctionDataParameters} params - The parameters for encoding the function data.
 * @param {SequencerInboxAbi} params.abi - The ABI of the Sequencer Inbox contract.
 * @param {SequencerInboxFunctionName} params.functionName - The name of the function to encode.
 * @param {Array<any>} params.args - The arguments for the function.
 * @returns {string} The encoded function data.
 */
function sequencerInboxEncodeFunctionData<TFunctionName extends SequencerInboxFunctionName>({
  abi,
  functionName,
  args,
}: SequencerInboxEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}

/**
 * Parameters for preparing function data for the Sequencer Inbox contract.
 *
 * @typedef {Object} SequencerInboxPrepareFunctionDataParameters
 * @property {SequencerInboxAbi} abi - The ABI of the Sequencer Inbox contract.
 * @property {SequencerInboxFunctionName} functionName - The name of the function to encode.
 * @property {Array<any>} args - The arguments for the function.
 * @property {Address | false} upgradeExecutor - The address of the upgrade executor, or false if not applicable.
 * @property {Address} sequencerInbox - The address of the Sequencer Inbox contract.
 */
type SequencerInboxPrepareFunctionDataParameters<TFunctionName extends SequencerInboxFunctionName> =
  SequencerInboxEncodeFunctionDataParameters<TFunctionName> & {
    upgradeExecutor: Address | false;
    abi: SequencerInboxAbi;
    sequencerInbox: Address;
  };

/**
 * Prepares function data for the Sequencer Inbox contract.
 *
 * @param {SequencerInboxPrepareFunctionDataParameters} params - The parameters for preparing the function data.
 * @param {SequencerInboxAbi} params.abi - The ABI of the Sequencer Inbox contract.
 * @param {SequencerInboxFunctionName} params.functionName - The name of the function to encode.
 * @param {Array<any>} params.args - The arguments for the function.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor, or false if not applicable.
 * @param {Address} params.sequencerInbox - The address of the Sequencer Inbox contract.
 * @returns {Object} The prepared function data, including the target address, encoded data, and value.
 */
function sequencerInboxPrepareFunctionData<TFunctionName extends SequencerInboxFunctionName>(
  params: SequencerInboxPrepareFunctionDataParameters<TFunctionName>,
) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: params.sequencerInbox,
      data: sequencerInboxEncodeFunctionData(
        params as SequencerInboxEncodeFunctionDataParameters<TFunctionName>,
      ),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        params.sequencerInbox, // target
        sequencerInboxEncodeFunctionData(
          params as SequencerInboxEncodeFunctionDataParameters<TFunctionName>,
        ), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type SequencerInboxPrepareTransactionRequestParameters<
  TFunctionName extends SequencerInboxFunctionName,
> = Omit<SequencerInboxPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

/**
 * Prepares a transaction request for the Sequencer Inbox contract.
 *
 * @param {PublicClient} client - The public client to use for the transaction.
 * @param {SequencerInboxPrepareTransactionRequestParameters} params - The parameters for preparing the transaction request.
 * @param {SequencerInboxFunctionName} params.functionName - The name of the function to encode.
 * @param {Array<any>} params.args - The arguments for the function.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor, or false if not applicable.
 * @param {Address} params.sequencerInbox - The address of the Sequencer Inbox contract.
 * @param {Address} params.account - The address of the account initiating the transaction.
 * @returns {Promise<Object>} The prepared transaction request, including the chain ID.
 */
export async function sequencerInboxPrepareTransactionRequest<
  TFunctionName extends SequencerInboxFunctionName,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  params: SequencerInboxPrepareTransactionRequestParameters<TFunctionName>,
) {
  const validatedPublicClient = validateParentChainPublicClient(client);

  // params is extending SequencerInboxPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = sequencerInboxPrepareFunctionData({
    ...params,
    abi: sequencerInbox.abi,
  } as unknown as SequencerInboxPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: validatedPublicClient.chain.id };
}
