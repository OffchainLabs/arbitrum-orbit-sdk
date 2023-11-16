import { PublicClient, WalletClient, GetFunctionArgs } from 'viem';

import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { defaults } from './createRollupDefaults';
import {
  createRollupPrepareTransactionReceipt,
  CreateRollupTransactionReceipt,
} from './createRollupPrepareTransactionReceipt';

export type CreateRollupFunctionParams = GetFunctionArgs<
  typeof rollupCreator.abi,
  'createRollup'
>['args'][0];

type RequiredKeys = 'config' | 'batchPoster' | 'validators';

export type CreateRollupParams = Pick<
  CreateRollupFunctionParams,
  RequiredKeys
> &
  Partial<Omit<CreateRollupFunctionParams, RequiredKeys>>;

export async function createRollup({
  params,
  publicClient,
  walletClient,
}: {
  params: CreateRollupParams;
  publicClient: PublicClient;
  walletClient: WalletClient;
}): Promise<CreateRollupTransactionReceipt> {
  const chainId = publicClient.chain?.id;
  const account = walletClient.account?.address;

  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const { request } = await publicClient.simulateContract({
    address: rollupCreator.address[chainId],
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args: [{ ...defaults, ...params }],
    value: BigInt(0),
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

  return createRollupPrepareTransactionReceipt(txReceipt);
}
