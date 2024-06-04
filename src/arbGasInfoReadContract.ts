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

/**
 * Reads information from the ArbGasInfo contract on the specified chain and
 * returns the result.
 */
export function arbGasInfoReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbGasInfoFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbGasInfoReadContractParameters<TFunctionName>,
): Promise<ArbGasInfoReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbGasInfo.address,
    abi: arbGasInfo.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
