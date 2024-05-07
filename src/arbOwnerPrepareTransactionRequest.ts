import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
  GetFunctionArgs,
} from 'viem';

import { arbOwner, ArbOSVersions, ArbOwnerABIs } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { ArbOwnerPublicAbi, ArbOwnerPublicFunctionName } from './arbOwnerReadContract';

export type ArbOwnerEncodeFunctionDataParameters<
  TArbOsVersion extends ArbOSVersions,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
> = EncodeFunctionDataParameters<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName> & {
  upgradeExecutor: Address | false;
};

function arbOwnerPrepareFunctionData<
  TArbOsVersion extends ArbOSVersions,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
>(params: ArbOwnerEncodeFunctionDataParameters<TArbOsVersion, TFunctionName>) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: arbOwner.address,
      data: encodeFunctionData(
        params as EncodeFunctionDataParameters<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName>,
      ),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        arbOwner.address, // target
        encodeFunctionData(
          params as EncodeFunctionDataParameters<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName>,
        ), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type ArbOwnerPrepareTransactionRequestParameters<
  TArbOsVersion extends ArbOSVersions,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
> = {
  functionName: TFunctionName;
  account: Address;
  upgradeExecutor: Address | false;
} & GetFunctionArgs<ArbOwnerPublicAbi<TArbOsVersion>, TFunctionName>;

export async function arbOwnerPrepareTransactionRequest<
  TArbOsVersion extends ArbOSVersions,
  TChain extends Chain | undefined,
  TFunctionName extends ArbOwnerPublicFunctionName<TArbOsVersion>,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters<TArbOsVersion, TFunctionName> & {
    arbOsVersion: TArbOsVersion;
  },
) {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbOwnerPrepareTransactionRequest] client.chain is undefined');
  }

  const { to, data, value } = arbOwnerPrepareFunctionData({
    ...params,
    abi: ArbOwnerABIs[params.arbOsVersion],
  } as unknown as ArbOwnerEncodeFunctionDataParameters<TArbOsVersion, TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: client.chain.id };
}
