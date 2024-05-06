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

import { rollupAdminLogicABI } from './abi/rollupAdminLogicABI';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { validateParentChainPublicClient } from './types/ParentChain';
import { GetPrepareTransactionRequestParams } from './types/utils';

type RollupAdminLogicAbi = typeof rollupAdminLogicABI;
export type RollupAdminLogicPrepareTransactionRequestFunctionName = GetPrepareTransactionRequestParams<RollupAdminLogicAbi>;
type RollupAdminLogicPrepareTransactionRequestArgs<
  TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName,
> = ContractFunctionArgs<RollupAdminLogicAbi, 'nonpayable' | 'payable', TFunctionName>;

type RollupAdminLogicEncodeFunctionDataParameters<
  TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName,
  TArgs extends RollupAdminLogicPrepareTransactionRequestArgs<TFunctionName> = RollupAdminLogicPrepareTransactionRequestArgs<TFunctionName>,
> = EncodeFunctionDataParameters<RollupAdminLogicAbi, TFunctionName> & {
  args: TArgs;
};

function rollupAdminLogicEncodeFunctionData<TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName>({
  functionName,
  abi,
  args,
}: RollupAdminLogicEncodeFunctionDataParameters<TFunctionName>): EncodeFunctionDataReturnType {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);
}

type RollupAdminLogicPrepareFunctionDataReturnType = {
  to: Address;
  data: `0x${string}`;
  value: BigInt;
};
type RollupAdminLogicPrepareFunctionDataParameters<
  TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName,
> = RollupAdminLogicEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  rollup: Address;
};
function rollupAdminLogicPrepareFunctionData<TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName>(
  params: RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>,
): RollupAdminLogicPrepareFunctionDataReturnType {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: params.rollup,
      data: rollupAdminLogicEncodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        params.rollup, // target
        rollupAdminLogicEncodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type RollupAdminLogicPrepareTransactionRequestParameters<
  TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName,
> = Omit<RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>, 'abi'> & {
  account: Address;
};

export type RollupAdminLogicPrepareTransactionRequestReturnType<TChain extends Chain | undefined> =
  PrepareTransactionRequestReturnType<TChain>;
export async function rollupAdminLogicPrepareTransactionRequest<
  TFunctionName extends RollupAdminLogicPrepareTransactionRequestFunctionName,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  params: RollupAdminLogicPrepareTransactionRequestParameters<TFunctionName>,
): Promise<RollupAdminLogicPrepareTransactionRequestReturnType<TChain>> {
  const validatedPublicClient = validateParentChainPublicClient(client);

  // params is extending RollupAdminLogicPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = rollupAdminLogicPrepareFunctionData({
    ...params,
    abi: rollupAdminLogicABI,
  } as unknown as RollupAdminLogicPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: validatedPublicClient.chain.id } as unknown as Promise<
    RollupAdminLogicPrepareTransactionRequestReturnType<TChain>
  >;
}
