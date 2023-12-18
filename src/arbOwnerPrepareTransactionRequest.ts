import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  PrepareTransactionRequestReturnType,
  zeroAddress,
  Chain,
  Transport,
  Abi,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { GetFunctionName, Prettify } from './types/utils';

type ArbOwnerEncodeFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof arbOwner.abi, string>, 'abi'>
>;

function arbOwnerEncodeFunctionData({
  functionName,
  args,
}: ArbOwnerEncodeFunctionDataParameters) {
  return encodeFunctionData({
    abi: arbOwner.abi,
    functionName,
    args,
  });
}

function arbOwnerPrepareFunctionData(
  params: ArbOwnerEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
  }
) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: arbOwner.address,
      data: arbOwnerEncodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        arbOwner.address, // target
        arbOwnerEncodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type ArbOwnerPrepareTransactionRequestParameters = Prettify<
  ArbOwnerEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
    account: Address;
  }
>;

export async function arbOwnerPrepareTransactionRequest<
  TChain extends Chain | undefined
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters
) {
  if (typeof client.chain === 'undefined') {
    throw new Error(
      '[arbOwnerPrepareTransactionRequest] client.chain is undefined'
    );
  }

  const { to, data, value } = arbOwnerPrepareFunctionData(params);

  //@ts-ignore
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: client.chain.id };
}
