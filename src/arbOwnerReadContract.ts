import { Chain, GetFunctionArgs, Client, ReadContractReturnType, Transport } from 'viem';

import { ArbOSVersions, ArbOwnerABIs, arbOwnerPublic } from './contracts';
import { GetFunctionName } from './types/utils';

export type ArbOwnerPublicAbi<TArbOsVersion extends ArbOSVersions> =
  (typeof ArbOwnerABIs)[TArbOsVersion];

export type ArbOwnerPublicFunctionName<TArbOsVersion extends ArbOSVersions> = GetFunctionName<
  ArbOwnerPublicAbi<TArbOsVersion>
>;

export type ArbOwnerReadContractParameters<
  TArbOsVersion extends ArbOSVersions,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
> = {
  functionName: TFunctionName;
} & GetFunctionArgs<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName>;

export type ArbOwnerReadContractReturnType<
  TArbOsVersion extends ArbOSVersions,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
> = ReadContractReturnType<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName>;

export function arbOwnerReadContract<
  TArbOsVersion extends ArbOSVersions,
  TChain extends Chain | undefined,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
>(
  client: Client<Transport, TChain>,
  params: ArbOwnerReadContractParameters<TArbOsVersion, TFunctionName> & {
    arbOsVersion: TArbOsVersion;
  },
): Promise<ArbOwnerReadContractReturnType<TArbOsVersion, TFunctionName>> {
  // @ts-ignore (todo: fix viem type issue)
  return client.readContract({
    address: arbOwnerPublic.address,
    abi: ArbOwnerABIs[params.arbOsVersion],
    functionName: params.functionName,
    args: params.args,
  });
}
