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
 * Reads data from the ArbAggregator contract.
 *
 * @template TChain - The chain type, can be undefined.
 * @template TFunctionName - The function name type from the ArbAggregator ABI.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to use for the contract call.
 * @param {ArbAggregatorReadContractParameters<TFunctionName>} params - The parameters for the contract function.
 * @param {string} params.functionName - The name of the function to call on the contract.
 * @param {Array<any>} [params.args] - The arguments to pass to the contract function, optional.
 *
 * @returns {Promise<ArbAggregatorReadContractReturnType<TFunctionName>>} - The result of the contract call.
 *
 * @example
 * const result = await arbAggregatorReadContract(client, {
 *   functionName: 'getLatestAnswer',
 *   args: [],
 * });
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
