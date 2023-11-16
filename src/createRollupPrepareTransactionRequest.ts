import { Address, PublicClient, encodeFunctionData } from 'viem';

import { CreateRollupParams } from './createRollup';
import { defaults } from './createRollupDefaults';
import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';

function createRollupEncodeFunctionData({
  params,
}: {
  params: CreateRollupParams;
}) {
  return encodeFunctionData({
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args: [{ ...defaults, ...params }],
  });
}

export async function createRollupPrepareTransactionRequest({
  params,
  account,
  publicClient,
}: {
  params: CreateRollupParams;
  account: Address;
  publicClient: PublicClient;
}) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreator.address[chainId],
    data: createRollupEncodeFunctionData({ params }),
    value: BigInt(0),
    account,
  });

  return { ...request, chainId };
}
