import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
} from 'viem';

import { rollupAdminLogicABI } from './contracts';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';
import { Prettify } from './types/utils';

type RollupAdminLogicEncodeFunctionDataParameters = Prettify<
  Omit<EncodeFunctionDataParameters<typeof rollupAdminLogicABI, string>, 'abi'>
> & {
  rollupAdminLogicAddress: Address;
};

function rollupAdminLogicEncodeFunctionData({
  functionName,
  args,
}: RollupAdminLogicEncodeFunctionDataParameters) {
  return encodeFunctionData({
    abi: rollupAdminLogicABI,
    functionName,
    args,
  });
}

function rollupAdminLogicPrepareFunctionData(
  params: RollupAdminLogicEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
  },
) {
  const { upgradeExecutor, rollupAdminLogicAddress } = params;

  if (!upgradeExecutor) {
    return {
      to: rollupAdminLogicAddress,
      data: rollupAdminLogicEncodeFunctionData(params),
      value: BigInt(0),
    };
  }

  return {
    to: upgradeExecutor,
    data: upgradeExecutorEncodeFunctionData({
      functionName: 'executeCall',
      args: [
        rollupAdminLogicAddress, // target
        rollupAdminLogicEncodeFunctionData(params), // targetCallData
      ],
    }),
    value: BigInt(0),
  };
}

export type RollupAdminLogicPrepareTransactionRequestParameters = Prettify<
  RollupAdminLogicEncodeFunctionDataParameters & {
    upgradeExecutor: Address | false;
    account: Address;
  }
>;

export async function rollupAdminLogicPrepareTransactionRequest<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  params: RollupAdminLogicPrepareTransactionRequestParameters,
) {
  if (typeof client.chain === 'undefined') {
    throw new Error('[rollupAdminLogicPrepareTransactionRequest] client.chain is undefined');
  }

  const { to, data, value } = rollupAdminLogicPrepareFunctionData(params);

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
