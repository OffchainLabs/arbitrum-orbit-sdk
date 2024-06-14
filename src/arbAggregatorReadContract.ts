import { Chain, GetFunctionArgs, PublicClient, ReadContractReturnType, Transport } from 'viem';

import { arbAggregator } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbAggregatorAbi = typeof arbAggregator.abi;
export type ArbAggregatorFunctionName = GetFunctionName<ArbAggregatorAbi>;

export type ArbAggregatorReadContractParameters<TFunctionName extends ArbAggregatorFunctionName> = {
  functionName: TFunctionName;
} & GetFunctionArgs<ArbAggregatorAbi, TFunctionName>;

export type ArbAggregatorReadContractReturnType<TFunctionName extends ArbAggregatorFunctionName> =
  ReadContractReturnType<ArbAggregatorAbi, TFunctionName>;

export function arbAggregatorReadContract<
  TChain extends Chain | undefined,
  TFunctionName extends ArbAggregatorFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbAggregatorReadContractParameters<TFunctionName>,
): Promise<ArbAggregatorReadContractReturnType<TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbAggregator.address,
    abi: arbAggregator.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
