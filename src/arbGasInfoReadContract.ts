import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbGasInfo } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbGasInfoAbi = typeof arbGasInfo.abi;
export type ArbGasInfoFunctionName = GetFunctionName<ArbGasInfoAbi>;

export type ArbGasInfoReadContractParameters<TFunctionName extends ArbGasInfoFunctionName> = {
  /**
   * The name of the function to be called in the contract.
   */
  functionName: TFunctionName;
} & GetFunctionArgs<ArbGasInfoAbi, TFunctionName>;

export type ArbGasInfoReadContractReturnType<TFunctionName extends ArbGasInfoFunctionName> =
  ReadContractReturnType<ArbGasInfoAbi, TFunctionName>;

/**
 * Reads data from the ArbGasInfo contract.
 *
 * @template TChain - The type of the chain (or undefined).
 * @template TFunctionName - The name of the function to be called in the contract.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to interact with the blockchain.
 * @param {ArbGasInfoReadContractParameters<TFunctionName>} params - The parameters for the contract function call.
 * @param {string} params.functionName - The name of the function to be called in the contract.
 * @param {Array<any>} [params.args] - The arguments to be passed to the contract function.
 *
 * @returns {Promise<ArbGasInfoReadContractReturnType<TFunctionName>>} The result of the contract function call.
 *
 * @example
 * const client = new PublicClient(...);
 * const params = { functionName: 'getGasInfo', args: [] };
 * const result = await arbGasInfoReadContract(client, params);
 */
export function arbGasInfoReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbGasInfoFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbGasInfoReadContractParameters<TFunctionName>,
): Promise<ArbGasInfoReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbGasInfo.address,
    abi: arbGasInfo.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
