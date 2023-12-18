import {
  GetFunctionArgs,
  PublicClient,
  ReadContractReturnType,
  Transport,
} from 'viem';

import { arbOwnerPublic } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbOwnerPublicAbi = typeof arbOwnerPublic.abi;
export type ArbOwnerPublicFunctionName = GetFunctionName<ArbOwnerPublicAbi>;

export type ArbOwnerReadContractParameters<
  TFunctionName extends ArbOwnerPublicFunctionName
> = {
  functionName: TFunctionName;
} & GetFunctionArgs<ArbOwnerPublicAbi, TFunctionName>;

export type ArbOwnerReadContractReturnType<
  TFunctionName extends ArbOwnerPublicFunctionName
> = ReadContractReturnType<ArbOwnerPublicAbi, TFunctionName>;

export function arbOwnerReadContract<
  TFunctionName extends ArbOwnerPublicFunctionName
>(
  client: PublicClient<Transport>,
  params: ArbOwnerReadContractParameters<TFunctionName>
): Promise<ArbOwnerReadContractReturnType<TFunctionName>> {
  //
  // todo: fix this weird type issue
  // @ts-ignore
  return client.readContract({
    address: arbOwnerPublic.address,
    abi: arbOwnerPublic.abi,
    functionName: params.functionName,
    args: params.args,
  });
}
