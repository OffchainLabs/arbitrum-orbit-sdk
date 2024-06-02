import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbGasInfo } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbGasInfoAbi = typeof arbGasInfo.abi;
export type ArbGasInfoFunctionName = GetFunctionName<ArbGasInfoAbi>;

export type ArbGasInfoReadContractParameters<TFunctionName extends ArbGasInfoFunctionName> = {
  /**
   * The name of the function to be called on the ArbGasInfo contract.
   */
  functionName: TFunctionName;
} & GetFunctionArgs<ArbGasInfoAbi, TFunctionName>;

export type ArbGasInfoReadContractReturnType<TFunctionName extends ArbGasInfoFunctionName> =
  ReadContractReturnType<ArbGasInfoAbi, TFunctionName>;

/**
 * Reads data from the ArbGasInfo contract on a specified chain and returns the
 * result.
 *
 * @template TChain - The type of the chain, can be a specific chain or undefined.
 * @template TFunctionName - The name of the function to be called on the ArbGasInfo contract.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to interact with the blockchain.
 * @param {ArbGasInfoReadContractParameters<TFunctionName>} params - The parameters for reading the contract.
 * @param {string} params.functionName - The name of the function to be called.
 * @param {Array<any>} [params.args] - The arguments to be passed to the function.
 *
 * @returns {Promise<ArbGasInfoReadContractReturnType<TFunctionName>>} - The result of the contract call.
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
