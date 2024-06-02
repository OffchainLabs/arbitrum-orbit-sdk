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
 * Reads data from the sequencer inbox contract on a specified chain and returns
 * the result.
 *
 * @template TChain - The type of the blockchain chain.
 * @template TFunctionName - The name of the function to read from the contract.
 * @param {PublicClient<Transport, TChain>} client - The public client to interact with the blockchain.
 * @param {SequencerInboxReadContractParameters<TFunctionName>} params - The parameters for reading the contract.
 * @param {TFunctionName} params.functionName - The name of the function to read from the contract.
 * @param {Address} params.sequencerInbox - The address of the sequencer inbox contract.
 * @param {...any} params.args - The arguments to pass to the contract function.
 *
 * @returns {Promise<SequencerInboxReadContractReturnType<TFunctionName>>} - A promise that resolves to the result of the contract function.
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   functionName: 'getInboxAccumulators',
 *   sequencerInbox: '0x1234...abcd',
 *   args: [],
 * };
 * const result = await sequencerInboxReadContract(client, params);
 * console.log(result);
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
