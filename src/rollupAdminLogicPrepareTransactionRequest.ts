import {
  PublicClient,
  encodeFunctionData,
  EncodeFunctionDataParameters,
  Address,
  Chain,
  Transport,
  PrepareTransactionRequestParameters,
  PrepareTransactionRequestReturnType,
} from 'viem';

import { rollupAdminLogicABI } from './abi/rollupAdminLogicABI';
import { Prettify } from './types/utils';
import { upgradeExecutorEncodeFunctionData } from './upgradeExecutor';

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
): Promise<PrepareTransactionRequestReturnType<TChain> & { chainId: number }> {
  if (typeof client.chain === 'undefined') {
    throw new Error('[rollupAdminLogicPrepareTransactionRequest] client.chain is undefined');
  }

  const { to, data, value } = rollupAdminLogicPrepareFunctionData(params);

  const prepareTransactionRequestParams: PrepareTransactionRequestParameters = {
    chain: client.chain,
    account: params.account,
    to,
    data,
    value,
  };

  const request = await client.prepareTransactionRequest(prepareTransactionRequestParams);

  return { ...request, chainId: client.chain.id };
}
