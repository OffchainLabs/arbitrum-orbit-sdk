import {
  Address,
  Chain,
  GetFunctionArgs,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { GetFunctionName } from './types/utils';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { rollupAdminLogicABI } from './abi/rollupAdminLogicABI';

export type RollupAdminLogicAbi = typeof rollupAdminLogicABI;
export type RollupAdminLogicFunctionName = GetFunctionName<RollupAdminLogicAbi>;

export type RollupAdminLogicReadContractParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
> = {
  /**
   * The name of the function to call on the RollupAdminLogic contract
   */
  functionName: TFunctionName;
  /**
   * The address of the RollupAdminLogic contract
   */
  rollup: Address;
} & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;

export type RollupAdminLogicReadContractReturnType<
  TFunctionName extends RollupAdminLogicFunctionName,
> = ReadContractReturnType<RollupAdminLogicAbi, TFunctionName>;

/**
 * Reads data from the RollupAdminLogic contract on the specified rollup chain
 * and returns the result.
 *
 * @template TChain - The type of the chain (or undefined)
 * @template TFunctionName - The name of the function to call
 *
 * @param {PublicClient<Transport, TChain>} client - The public client to use for the read operation
 * @param {RollupAdminLogicReadContractParameters<TFunctionName>} params - The parameters for the read operation
 * @param {TFunctionName} params.functionName - The name of the function to call on the RollupAdminLogic contract
 * @param {Address} params.rollup - The address of the RollupAdminLogic contract
 * @param {Array} params.args - The arguments for the function call
 *
 * @returns {Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>} - The result of the read operation
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   functionName: 'getOwner',
 *   rollup: '0x1234567890abcdef1234567890abcdef12345678',
 *   args: [],
 * };
 * const result = await rollupAdminLogicReadContract(client, params);
 * console.log(result);
 */
export function rollupAdminLogicReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends RollupAdminLogicFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: RollupAdminLogicReadContractParameters<TFunctionName>,
): Promise<RollupAdminLogicReadContractReturnType<TFunctionName>> {
  return client.readContract({
    address: params.rollup,
    abi: RollupAdminLogic__factory.abi,
    functionName: params.functionName,
    args: params.args,
  } as unknown as ReadContractParameters<RollupAdminLogicAbi, TFunctionName>);
}
