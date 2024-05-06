import {
  Chain,
  PublicClient,
  Transport,
  ContractFunctionArgs,
  ReadContractParameters,
  ReadContractReturnType,
} from 'viem';

import { arbOwnerPublic } from './contracts';
import { GetReadContractFunctionName } from './types/utils';

type ArbOwnerPublicAbi = typeof arbOwnerPublic.abi;
export type ArbOwnerPublicFunctionName = GetReadContractFunctionName<ArbOwnerPublicAbi>;
type ArbOwnerReadContractArgs<TFunctionName extends ArbOwnerPublicFunctionName> = ContractFunctionArgs<
  ArbOwnerPublicAbi,
  'pure' | 'view',
  TFunctionName
>;

export type ArbOwnerReadContractParameters<
  TFunctionName extends ArbOwnerPublicFunctionName,
  TArgs extends ArbOwnerReadContractArgs<TFunctionName> = ArbOwnerReadContractArgs<TFunctionName>,
> = Omit<ReadContractParameters<ArbOwnerPublicAbi, TFunctionName, TArgs>, 'abi' | 'address'>
export type ArbOwnerReadContractReturnType<
  TFunctionName extends ArbOwnerPublicFunctionName,
  TArgs extends ArbOwnerReadContractArgs<TFunctionName> = ArbOwnerReadContractArgs<TFunctionName>
> = ReadContractReturnType<ArbOwnerPublicAbi, TFunctionName, TArgs>;

export function arbOwnerReadContract<
  TFunctionName extends ArbOwnerPublicFunctionName,
  TChain extends Chain | undefined,
>(client: PublicClient<Transport, TChain>, params: ArbOwnerReadContractParameters<TFunctionName>) {
  return client.readContract({
    address: arbOwnerPublic.address,
    abi: arbOwnerPublic.abi,
    functionName: params.functionName,
    args: params.args,
  } as ReadContractParameters<ArbOwnerPublicAbi, TFunctionName, ArbOwnerReadContractArgs<TFunctionName>>);
}
