import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Transport,
  Chain,
} from 'viem';

import { sequencerInbox } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { Prettify } from './types/utils';
import { validateParentChainPublicClient } from './types/ParentChain';

type SequencerInboxEncodeFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof sequencerInbox.abi, string>, 'abi'>
> & {
  sequencerInbox: Address;
};

function sequencerInboxEncodeFunctionData({
  functionName,
  args,
}: SequencerInboxEncodeFunctionDataParameters) {
  return encodeFunctionData({
    abi: sequencerInbox.abi,
    functionName,
    args,
  });
}

function sequencerInboxPrepareFunctionData(
  params: SequencerInboxEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
  },
) {
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

export type SequencerInboxPrepareTransactionRequestParameters =
  Prettify<SequencerInboxEncodeFunctionDataParameters> & {
    upgradeExecutor: Address | false;
    account: Address;
  };

export async function sequencerInboxPrepareTransactionRequest<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: PublicClient<TTransport, TChain>,
  params: SequencerInboxPrepareTransactionRequestParameters,
) {
  const validatedPublicClient = validateParentChainPublicClient(client);

  const { to, data, value } = sequencerInboxPrepareFunctionData(params);

  // @ts-ignore (todo: fix viem type issue)
  const request = await client.prepareTransactionRequest({
    chain: client.chain,
    to,
    data,
    value,
    account: params.account,
  });

  return { ...request, chainId: validatedPublicClient.chain.id };
}
