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
   * The name of the function to be called on the contract.
   */
  functionName: TFunctionName;
  /**
   * The address of the rollup contract.
   */
  rollup: Address;
} & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;

export type RollupAdminLogicReadContractReturnType<
  TFunctionName extends RollupAdminLogicFunctionName,
> = ReadContractReturnType<RollupAdminLogicAbi, TFunctionName>;

/**
 * Reads data from a RollupAdminLogic contract.
 *
 * @template TChain - The chain type, can be undefined.
 * @template TFunctionName - The name of the function to be called on the contract.
 * @param {PublicClient<Transport, TChain>} client - The public client to interact with the blockchain.
 * @param {RollupAdminLogicReadContractParameters<TFunctionName>} params - The parameters for reading the contract.
 * @param {string} params.functionName - The name of the function to be called on the contract.
 * @param {Address} params.rollup - The address of the rollup contract.
 * @returns {Promise<RollupAdminLogicReadContractReturnType<TFunctionName>>} - The result of the contract call.
 *
 * @example
 * const client = new PublicClient(...);
 * const params = {
 *   functionName: 'someFunction',
 *   rollup: '0x1234567890abcdef',
 *   args: [...],
 * };
 * const result = await rollupAdminLogicReadContract(client, params);
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
