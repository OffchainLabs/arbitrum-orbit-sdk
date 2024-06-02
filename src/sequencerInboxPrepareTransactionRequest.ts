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

type SequencerInboxEncodeFunctionDataParameters<TFunctionName extends SequencerInboxFunctionName> =
  EncodeFunctionDataParameters<SequencerInboxAbi, TFunctionName>;

/**
 * Encodes function data for the Sequencer Inbox contract.
 *
 * @template TFunctionName - The name of the function to encode.
 * @param {SequencerInboxEncodeFunctionDataParameters<TFunctionName>} params - The parameters for encoding the function data.
 * @param {SequencerInboxAbi} params.abi - The ABI of the Sequencer Inbox contract.
 * @param {TFunctionName} params.functionName - The name of the function to encode.
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

type SequencerInboxPrepareFunctionDataParameters<TFunctionName extends SequencerInboxFunctionName> =
  SequencerInboxEncodeFunctionDataParameters<TFunctionName> & {
    upgradeExecutor: Address | false;
    abi: SequencerInboxAbi;
    sequencerInbox: Address;
  };

/**
 * Prepares function data for the Sequencer Inbox contract.
 *
 * @template TFunctionName - The name of the function to prepare.
 * @param {SequencerInboxPrepareFunctionDataParameters<TFunctionName>} params - The parameters for preparing the function data.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor or false if not applicable.
 * @param {SequencerInboxAbi} params.abi - The ABI of the Sequencer Inbox contract.
 * @param {Address} params.sequencerInbox - The address of the Sequencer Inbox contract.
 * @returns {Object} The prepared function data including the target address, data, and value.
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
 * Prepares a transaction request to interact with the Sequencer Inbox contract on a specified chain.
 *
 * @template TFunctionName - The name of the function to call on the Sequencer Inbox contract.
 * @template TTransport - The transport type for the PublicClient.
 * @template TChain - The chain type.
 * @param {PublicClient<TTransport, TChain>} client - The public client to use for the transaction.
 * @param {SequencerInboxPrepareTransactionRequestParameters<TFunctionName>} params - The parameters for the transaction request.
 * @param {TFunctionName} params.functionName - The name of the function to call on the Sequencer Inbox contract.
 * @param {Array<any>} params.args - The arguments for the function call.
 * @param {Address | false} params.upgradeExecutor - The address of the upgrade executor or false if not applicable.
 * @param {Address} params.sequencerInbox - The address of the Sequencer Inbox contract.
 * @param {Address} params.account - The account address to use for the transaction.
 * @returns {Promise<Object>} The prepared transaction request object.
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
