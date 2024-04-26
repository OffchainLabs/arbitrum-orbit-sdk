import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
  GetFunctionArgs,
  PrepareTransactionRequestReturnType,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { GetFunctionName, Prettify } from './types/utils';
import { arbOwnerABI } from './generated';

export type ArbOwnerAbi = typeof arbOwnerABI;
export type ArbOwnerFunctionName = GetFunctionName<ArbOwnerAbi>;

type ArbOwnerEncodeFunctionDataParameters<TFunctionName extends ArbOwnerFunctionName> =
  EncodeFunctionDataParameters<typeof arbOwnerABI, TFunctionName>
function arbOwnerEncodeFunctionData<TFunctionName extends ArbOwnerFunctionName>({ functionName, abi, args }: ArbOwnerEncodeFunctionDataParameters<TFunctionName>) {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  });
}

// Type intersection would be too slow here, we need to split upgradeExecutor in a second param
function arbOwnerPrepareFunctionData<TFunctionName extends ArbOwnerFunctionName>(
  params: ArbOwnerEncodeFunctionDataParameters<TFunctionName>,
  upgradeExecutor: Address | false
) {
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

export type ArbOwnerPrepareTransactionRequestParameters<TFunctionName extends ArbOwnerFunctionName> = Prettify<
{
  functionName: TFunctionName;
} & GetFunctionArgs<ArbOwnerAbi, TFunctionName> & {
    upgradeExecutor: Address | false;
    account: Address;
  }
>;

export async function arbOwnerPrepareTransactionRequest<
  TChain extends Chain | undefined,
  TFunctionName extends ArbOwnerFunctionName,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
): Promise<PrepareTransactionRequestReturnType & { chainId: number }> {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbOwnerPrepareTransactionRequest] client.chain is undefined');
  }

  const { upgradeExecutor, ...restParams } = params
  const { to, data, value } = arbOwnerPrepareFunctionData(restParams as unknown as ArbOwnerPrepareTransactionRequestParameters<TFunctionName>, upgradeExecutor);

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
