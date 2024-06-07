import {
  Address,
  Chain,
  GetFunctionArgs,
  PublicClient,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { sequencerInbox } from './contracts';
import {
  SequencerInboxAbi,
  SequencerInboxFunctionName,
} from './sequencerInboxPrepareTransactionRequest';

export type SequencerInboxReadContractParameters<TFunctionName extends SequencerInboxFunctionName> =
  {
    functionName: TFunctionName;
    // SequencerInbox address is different for each rollup, so user needs to pass it as a parameter
    sequencerInbox: Address;
  } & GetFunctionArgs<SequencerInboxAbi, TFunctionName>;

export type SequencerInboxReadContractReturnType<TFunctionName extends SequencerInboxFunctionName> =
  ReadContractReturnType<SequencerInboxAbi, TFunctionName>;

/**
 * Reads data from the SequencerInbox contract.
 *
 * @template TChain - The type of the blockchain chain.
 * @template TFunctionName - The name of the function to call on the SequencerInbox contract.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to use for the contract read.
 * @param {SequencerInboxReadContractParameters<TFunctionName>} params - The parameters for the contract read.
 * @param {TFunctionName} params.functionName - The name of the function to call on the SequencerInbox contract.
 * @param {Address} params.sequencerInbox - The address of the SequencerInbox contract.
 * @param {Array<any>} params.args - The arguments to pass to the function.
 *
 * @returns {Promise<SequencerInboxReadContractReturnType<TFunctionName>>} - The result of the contract read.
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   functionName: 'getInboxAccs',
 *   sequencerInbox: '0x1234567890abcdef...',
 *   args: [],
 * };
 * const result = await sequencerInboxReadContract(client, params);
 */
export function sequencerInboxReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends SequencerInboxFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: SequencerInboxReadContractParameters<TFunctionName>,
): Promise<SequencerInboxReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: params.sequencerInbox,
    abi: sequencerInbox.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
