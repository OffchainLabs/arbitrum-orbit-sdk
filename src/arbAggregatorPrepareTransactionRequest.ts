import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
} from 'viem';

import { arbAggregator } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { Prettify } from './types/utils';

type ArbAggregatorEncodeFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof arbAggregator.abi, string>, 'abi'>
>;

function arbAggregatorEncodeFunctionData({
  functionName,
  args,
}: ArbAggregatorEncodeFunctionDataParameters) {
  return encodeFunctionData({
    abi: arbAggregator.abi,
    functionName,
    args,
  });
}

function arbAggregatorPrepareFunctionData(
  params: ArbAggregatorEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
  },
) {
  const { upgradeExecutor } = params;

  if (!upgradeExecutor) {
    return {
      to: arbAggregator.address,
      data: arbAggregatorEncodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        arbAggregator.address, // target
        arbAggregatorEncodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type ArbAggregatorPrepareTransactionRequestParameters = Prettify<
  ArbAggregatorEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
    account: Address;
  }
>;

export async function arbAggregatorPrepareTransactionRequest<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: ArbAggregatorPrepareTransactionRequestParameters,
) {
  if (typeof client.chain === 'undefined') {
    throw new Error('[arbAggregatorPrepareTransactionRequest] client.chain is undefined');
  }

  const { to, data, value } = arbAggregatorPrepareFunctionData(params);

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
