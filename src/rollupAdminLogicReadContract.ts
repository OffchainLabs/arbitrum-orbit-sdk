import {
  Address,
  GetFunctionArgs,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { GetFunctionName } from './types/utils';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';
import { rollupAdminLogicABI } from './contracts';

export type RollupAdminLogicAbi = typeof rollupAdminLogicABI;
export type RollupAdminLogicFunctionName = GetFunctionName<RollupAdminLogicAbi>;

export type RollupAdminLogicReadContractParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
> = {
  functionName: TFunctionName;
} & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;

export type RollupAdminLogicReadContractReturnType<
  TFunctionName extends RollupAdminLogicFunctionName,
> = ReadContractReturnType<RollupAdminLogicAbi, TFunctionName>;

export function rollupAdminLogicReadContract<TFunctionName extends RollupAdminLogicFunctionName>(
  rollupAddress: Address,
  client: PublicClient<Transport>,
  params: RollupAdminLogicReadContractParameters<TFunctionName>,
): Promise<RollupAdminLogicReadContractReturnType<TFunctionName>> {
  return client.readContract({
    address: rollupAddress,
    abi: RollupAdminLogic__factory.abi,
    functionName: params.functionName,
  } as unknown as ReadContractParameters<RollupAdminLogicAbi, TFunctionName>);
}
