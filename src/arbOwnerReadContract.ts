import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbOwnerPublic } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbOwnerPublicAbi = typeof arbOwnerPublic.abi;
export type ArbOwnerPublicFunctionName = GetFunctionName<ArbOwnerPublicAbi>;

export type ArbOwnerReadContractParameters<TFunctionName extends ArbOwnerPublicFunctionName> = {
  /**
   * The name of the function to call on the contract.
   */
  functionName: TFunctionName;
} & GetFunctionArgs<ArbOwnerPublicAbi, TFunctionName>;

export type ArbOwnerReadContractReturnType<TFunctionName extends ArbOwnerPublicFunctionName> =
  ReadContractReturnType<ArbOwnerPublicAbi, TFunctionName>;

/**
 * Reads data from a contract owned by an arbitrary owner.
 *
 * @template TChain - The type of the blockchain chain.
 * @template TFunctionName - The name of the function to call on the contract.
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to use for reading the contract.
 * @param {ArbOwnerReadContractParameters<TFunctionName>} params - The parameters for reading the contract.
 * @param {TFunctionName} params.functionName - The name of the function to call on the contract.
 * @param {Array} [params.args] - The arguments to pass to the function.
 *
 * @returns {Promise<ArbOwnerReadContractReturnType<TFunctionName>>} - The result of reading the contract.
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
