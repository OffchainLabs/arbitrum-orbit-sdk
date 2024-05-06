import { Chain, ContractFunctionName,ContractFunctionArgs, PublicClient, ReadContractReturnType, Transport, ContractFunctionParameters } from 'viem';

import { arbGasInfo } from './contracts';

export type ArbGasInfoAbi = typeof arbGasInfo.abi;
export type ArbGasInfoFunctionName = ContractFunctionName<ArbGasInfoAbi>;

export type ArbGasInfoReadContractParameters<TFunctionName extends ArbGasInfoFunctionName> = {
  functionName: TFunctionName;
} & ContractFunctionArgs<ArbGasInfoAbi, TFunctionName>;

export type ArbGasInfoReadContractReturnType<TFunctionName extends ArbGasInfoFunctionName> =
  ReadContractReturnType<ArbGasInfoAbi, TFunctionName>;

export function arbGasInfoReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbGasInfoFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ContractFunctionParameters<ArbGasInfoAbi>,
): Promise<ArbGasInfoReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbGasInfo.address,
    abi: arbGasInfo.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
