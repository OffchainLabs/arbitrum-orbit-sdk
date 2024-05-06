import {
  Address,
  Chain,
  ContractFunctionArgs,
  PublicClient,
  ReadContractParameters,
  ReadContractReturnType,
  Transport,
} from 'viem';
import { RollupAdminLogic__factory } from '@arbitrum/sdk/dist/lib/abi/factories/RollupAdminLogic__factory';

import { GetReadContractFunctionName } from './types/utils';
import { rollupAdminLogicABI } from './abi/rollupAdminLogicABI';

export type RollupAdminLogicAbi = typeof rollupAdminLogicABI;
export type RollupAdminLogicFunctionName = GetReadContractFunctionName<RollupAdminLogicAbi>

type RollupAdminLogicContractArgs<TFunctionName extends RollupAdminLogicFunctionName> =
  ContractFunctionArgs<RollupAdminLogicAbi, 'pure' | 'view', TFunctionName>;

export type RollupAdminLogicReadContractParameters<
  TFunctionName extends RollupAdminLogicFunctionName,
  TArgs extends RollupAdminLogicContractArgs<TFunctionName> = RollupAdminLogicContractArgs<TFunctionName>,
> = Omit<ReadContractParameters<RollupAdminLogicAbi, TFunctionName, TArgs>, 'abi' | 'address'> & {
  rollup: Address;
};
export type RollupAdminLogicReadContractReturnType<
  TFunctionName extends RollupAdminLogicFunctionName,
  TArgs extends RollupAdminLogicContractArgs<TFunctionName> = RollupAdminLogicContractArgs<TFunctionName>,
> = ReadContractReturnType<RollupAdminLogicAbi, TFunctionName, TArgs>;

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
