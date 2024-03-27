import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbGasInfo } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbGasInfoAbi = typeof arbGasInfo.abi;
export type ArbGasInfoFunctionName = GetFunctionName<ArbGasInfoAbi>;

export type ArbGasInfoReadContractParameters<TFunctionName extends ArbGasInfoFunctionName> = {
  functionName: TFunctionName;
} & GetFunctionArgs<ArbGasInfoAbi, TFunctionName>;

export type ArbGasInfoReadContractReturnType<TFunctionName extends ArbGasInfoFunctionName> =
  ReadContractReturnType<ArbGasInfoAbi, TFunctionName>;

export function arbGasInfoReadContract<TFunctionName extends ArbGasInfoFunctionName>(
  client: PublicClient<Transport>,
  params: ArbGasInfoReadContractParameters<TFunctionName>,
): Promise<ArbGasInfoReadContractReturnType<TFunctionName>> {
  //
  // todo: fix this weird type issue
  // @ts-ignore
  return client.readContract({
    address: arbGasInfo.address,
    abi: arbGasInfo.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
