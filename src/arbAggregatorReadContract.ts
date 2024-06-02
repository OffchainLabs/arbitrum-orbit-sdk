import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbAggregator } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbAggregatorAbi = typeof arbAggregator.abi;
export type ArbAggregatorFunctionName = GetFunctionName<ArbAggregatorAbi>;

export type ArbAggregatorReadContractParameters<TFunctionName extends ArbAggregatorFunctionName> = {
  functionName: TFunctionName;
} & GetFunctionArgs<ArbAggregatorAbi, TFunctionName>;

export type ArbAggregatorReadContractReturnType<TFunctionName extends ArbAggregatorFunctionName> =
  ReadContractReturnType<ArbAggregatorAbi, TFunctionName>;

/**
 * Reads data from the ArbAggregator smart contract and returns the specified
 * result.
 *
 * @template TChain - The type of the blockchain chain.
 * @template TFunctionName - The name of the function to read from the contract.
 * @param {PublicClient<Transport, TChain>} client - The public client to interact with the blockchain.
 * @param {ArbAggregatorReadContractParameters<TFunctionName>} params - The parameters for reading the contract.
 * @param {TFunctionName} params.functionName - The name of the function to call on the contract.
 * @param {Array<any>} [params.args] - The arguments to pass to the contract function.
 * @returns {Promise<ArbAggregatorReadContractReturnType<TFunctionName>>} - The result from the contract function.
 * @example
 * const client = new PublicClient(...);
 * const result = await arbAggregatorReadContract(client, {
 *   functionName: 'getTotalStaked',
 *   args: [],
 * });
 * console.log(result);
 */
export function arbAggregatorReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbAggregatorFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbAggregatorReadContractParameters<TFunctionName>,
): Promise<ArbAggregatorReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbAggregator.address,
    abi: arbAggregator.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
