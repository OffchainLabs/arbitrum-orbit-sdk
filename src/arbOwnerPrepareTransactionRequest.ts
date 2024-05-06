import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
  PrepareTransactionRequestReturnType,
  EncodeFunctionDataReturnType,
  ContractFunctionArgs,
} from 'viem';

import { arbOwner } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { GetPrepreTransactionRequestParams } from './types/utils';

type ArbOwnerAbi = typeof arbOwner.abi;
export type ArbOwnerFunctionName = GetPrepreTransactionRequestParams<ArbOwnerAbi>;
type ArbOwnerPrepareTransactionRequestArgs<TFunctionName extends ArbOwnerFunctionName> =
  ContractFunctionArgs<ArbOwnerAbi, 'nonpayable' | 'payable', TFunctionName>;

type ArbOwnerEncodeFunctionDataParameters<
  TFunctionName extends ArbOwnerFunctionName,
  TArgs extends ArbOwnerPrepareTransactionRequestArgs<TFunctionName> = ArbOwnerPrepareTransactionRequestArgs<TFunctionName>,
> = EncodeFunctionDataParameters<ArbOwnerAbi, TFunctionName> & {
  args: TArgs;
};

function arbOwnerEncodeFunctionData<TFunctionName extends ArbOwnerFunctionName>({
  functionName,
  abi,
  args,
}: ArbOwnerEncodeFunctionDataParameters<TFunctionName>): EncodeFunctionDataReturnType {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);
}

type ArbOwnerPrepareFunctionDataReturnType = {
  to: Address;
  data: `0x${string}`;
  value: BigInt;
};
type ArbOwnerPrepareFunctionDataParameters<TFunctionName extends ArbOwnerFunctionName> =
  ArbOwnerEncodeFunctionDataParameters<TFunctionName> & {
    upgradeExecutor: Address | false;
  };
function arbOwnerPrepareFunctionData<TFunctionName extends ArbOwnerFunctionName>(
  params: ArbOwnerPrepareFunctionDataParameters<TFunctionName>,
): ArbOwnerPrepareFunctionDataReturnType {
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

export type ArbOwnerPrepareTransactionRequestParameters<
  TFunctionName extends ArbOwnerFunctionName,
> = Omit<ArbOwnerPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

export type ArbOwnerPrepareTransactionRequestReturnType<TChain extends Chain | undefined> =
  PrepareTransactionRequestReturnType<TChain>;
export async function arbOwnerPrepareTransactionRequest<
  TFunctionName extends ArbOwnerFunctionName,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<Transport, TChain>,
  params: ArbOwnerPrepareTransactionRequestParameters<TFunctionName>,
): Promise<ArbOwnerPrepareTransactionRequestReturnType<TChain>> {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbOwnerPrepareTransactionRequest] client.chain is undefined');
  }

  const { to, data, value } = arbOwnerPrepareFunctionData({
    ...params,
    abi: arbOwner.abi,
  } as unknown as ArbOwnerPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return {
    ...request,
    chainId: client.chain.id,
  } as unknown as Promise<ArbOwnerPrepareTransactionRequestReturnType<TChain>>;
}
