import {
  Chain,
  PublicClient,
  Transport,
  ContractFunctionArgs,
  ReadContractParameters,
  ReadContractReturnType,
} from 'viem';

import { arbGasInfo } from './contracts';
import { GetReadContractFunctionName } from './types/utils';

export type ArbGasInfoAbi = typeof arbGasInfo.abi;
export type ArbGasInfoFunctionName = GetReadContractFunctionName<ArbGasInfoAbi>;
type ArbGasInfoReadContractArgs<TFunctionName extends ArbGasInfoFunctionName> =
  ContractFunctionArgs<ArbGasInfoAbi, 'pure' | 'view', TFunctionName>;

export type ArbGasInfoReadContractParameters<
  TFunctionName extends ArbGasInfoFunctionName,
  TArgs extends ArbGasInfoReadContractArgs<TFunctionName> = ArbGasInfoReadContractArgs<TFunctionName>,
> = Omit<ReadContractParameters<ArbGasInfoAbi, TFunctionName, TArgs>, 'abi' | 'address'>;
export type ArbGasInfoReadContractReturnType<
  TFunctionName extends ArbGasInfoFunctionName,
  TArgs extends ArbGasInfoReadContractArgs<TFunctionName> = ArbGasInfoReadContractArgs<TFunctionName>,
> = ReadContractReturnType<ArbGasInfoAbi, TFunctionName, TArgs>;

export function arbGasInfoReadContract<
  TFunctionName extends ArbGasInfoFunctionName,
  TChain extends Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbGasInfoReadContractParameters<TFunctionName>,
) {
  return client.readContract({
    address: arbGasInfo.address,
    abi: arbGasInfo.abi,
    functionName: params.functionName,
    args: params.args,
  } as ReadContractParameters<ArbGasInfoAbi, TFunctionName, ArbGasInfoReadContractArgs<TFunctionName>>);
}
