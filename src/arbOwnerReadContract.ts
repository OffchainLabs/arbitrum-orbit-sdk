import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbOwnerPublic } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbOwnerPublicAbi = typeof arbOwnerPublic.abi;
export type ArbOwnerPublicFunctionName = GetFunctionName<ArbOwnerPublicAbi>;

export type ArbOwnerReadContractParameters<TFunctionName extends ArbOwnerPublicFunctionName> = {
  /**
   * The name of the function to call on the ArbOwnerPublic contract.
   */
  functionName: TFunctionName;
} & GetFunctionArgs<ArbOwnerPublicAbi, TFunctionName>;

export type ArbOwnerReadContractReturnType<TFunctionName extends ArbOwnerPublicFunctionName> =
  ReadContractReturnType<ArbOwnerPublicAbi, TFunctionName>;

/**
 * Reads data from the ArbOwnerPublic contract.
 *
 * @template TChain - The type of the blockchain chain.
 * @template TFunctionName - The name of the function to call on the contract.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to use for the read operation.
 * @param {ArbOwnerReadContractParameters<TFunctionName>} params - The parameters for the read operation.
 * @param {TFunctionName} params.functionName - The name of the function to call on the ArbOwnerPublic contract.
 * @param {Array} [params.args] - The arguments to pass to the function call.
 *
 * @returns {Promise<ArbOwnerReadContractReturnType<TFunctionName>>} - A promise that resolves to the result of the contract read operation.
 *
 * @example
 * const result = await arbOwnerReadContract(client, {
 *   functionName: 'getOwner',
 *   args: [],
 * });
 * console.log(result);
 */
export function arbOwnerReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbOwnerPublicFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerReadContractParameters<TFunctionName>,
): Promise<ArbOwnerReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbOwnerPublic.address,
    abi: arbOwnerPublic.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
