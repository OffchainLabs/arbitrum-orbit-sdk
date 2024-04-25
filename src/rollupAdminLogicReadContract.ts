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
  functionName: TFunctionName;
} & GetFunctionArgs<RollupAdminLogicAbi, TFunctionName>;

export type RollupAdminLogicReadContractParametersWithContractAddress<
  TFunctionName extends RollupAdminLogicFunctionName,
> = RollupAdminLogicReadContractParameters<TFunctionName> & {
  rollupAdminLogicAddress: Address;
};

export type RollupAdminLogicReadContractReturnType<
  TFunctionName extends RollupAdminLogicFunctionName,
> = ReadContractReturnType<RollupAdminLogicAbi, TFunctionName>;

export function rollupAdminLogicReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends RollupAdminLogicFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: RollupAdminLogicReadContractParametersWithContractAddress<TFunctionName>,
): Promise<RollupAdminLogicReadContractReturnType<TFunctionName>> {
  return client.readContract({
    address: params.rollupAdminLogicAddress,
    abi: RollupAdminLogic__factory.abi,
    functionName: params.functionName,
    args: params.args,
  } as unknown as ReadContractParameters<RollupAdminLogicAbi, TFunctionName>);
}
