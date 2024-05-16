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

import { sequencerInbox } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { validateParentChainPublicClient } from './types/ParentChain';
import { GetPrepareTransactionRequestParams } from './types/utils';

type SequencerInboxABI = typeof sequencerInbox.abi;
export type SequencerInboxPrepareTransactionRequestFunctionName =
  GetPrepareTransactionRequestParams<SequencerInboxABI>;
type SequencerInboxPrepareTransactionRequestArgs<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
> = ContractFunctionArgs<SequencerInboxABI, 'nonpayable' | 'payable', TFunctionName>;

type SequencerInboxEncodeFunctionDataParameters<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
  TArgs extends SequencerInboxPrepareTransactionRequestArgs<TFunctionName> = SequencerInboxPrepareTransactionRequestArgs<TFunctionName>,
> = EncodeFunctionDataParameters<SequencerInboxABI, TFunctionName> & {
  args: TArgs;
};

function sequencerInboxEncodeFunctionData<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
>({
  functionName,
  abi,
  args,
}: SequencerInboxEncodeFunctionDataParameters<TFunctionName>): EncodeFunctionDataReturnType {
  return encodeFunctionData({
    abi,
    functionName,
    args,
  } as EncodeFunctionDataParameters);
}

type SequencerInboxPrepareFunctionDataReturnType = {
  to: Address;
  data: `0x${string}`;
  value: BigInt;
};
type SequencerInboxPrepareFunctionDataParameters<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
> = SequencerInboxEncodeFunctionDataParameters<TFunctionName> & {
  upgradeExecutor: Address | false;
  sequencerInbox: Address;
};
function sequencerInboxPrepareFunctionData<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
>(
  params: SequencerInboxPrepareFunctionDataParameters<TFunctionName>,
): SequencerInboxPrepareFunctionDataReturnType {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: params.sequencerInbox,
      data: sequencerInboxEncodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        params.sequencerInbox, // target
        sequencerInboxEncodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type SequencerInboxPrepareTransactionRequestParameters<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
> = Omit<SequencerInboxPrepareFunctionDataParameters<TFunctionName>, 'abi' | 'functionName'> & {
  account: Address;
  functionName: TFunctionName;
};

export type SequencerInboxPrepareTransactionRequestReturnType<TChain extends Chain | undefined> =
  PrepareTransactionRequestReturnType<TChain>;
export async function sequencerInboxPrepareTransactionRequest<
  TFunctionName extends SequencerInboxPrepareTransactionRequestFunctionName,
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  params: SequencerInboxPrepareTransactionRequestParameters<TFunctionName>,
): Promise<SequencerInboxPrepareTransactionRequestReturnType<TChain>> {
  const validatedPublicClient = validateParentChainPublicClient(client);

  // params is extending SequencerInboxPrepareFunctionDataParameters, it's safe to cast
  const { to, data, value } = sequencerInboxPrepareFunctionData({
    ...params,
    abi: sequencerInbox.abi,
  } as unknown as SequencerInboxPrepareFunctionDataParameters<TFunctionName>);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: validatedPublicClient.chain.id } as unknown as Promise<
    SequencerInboxPrepareTransactionRequestReturnType<TChain>
  >;
}
