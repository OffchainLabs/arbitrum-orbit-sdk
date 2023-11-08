import {
  WalletClient,
  GetFunctionArgs,
  zeroAddress,
  PublicClient,
  TransactionReceipt,
  encodeFunctionData,
} from 'viem';

import { rollupCreator } from './contracts';
import { isSupportedParentChainId } from './utils/isSupportedParentChainId';

export const defaults = {
  maxDataSize: BigInt(104_857),
  nativeToken: zeroAddress,
  deployFactoriesToL2: false,
  maxFeePerGasForRetryables: BigInt(0),
};

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

export type CreateRollupResult = {
  txHash: `0x${string}`;
  txReceipt: TransactionReceipt;
};

export function createRollupEncodeFunctionData({
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
  publicClient,
  walletClient,
}: {
  params: CreateRollupParams;
  publicClient: PublicClient;
  walletClient: WalletClient;
}) {
  const chainId = publicClient.chain?.id;
  const account = walletClient.account?.address;

  if (!isSupportedParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const request = await walletClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreator.address[chainId],
    data: createRollupEncodeFunctionData({ params }),
    value: BigInt(0),
    account,
  });

  return { ...request, chainId };
}

export async function createRollup({
  params,
  publicClient,
  walletClient,
}: {
  params: CreateRollupParams;
  publicClient: PublicClient;
  walletClient: WalletClient;
}): Promise<CreateRollupResult> {
  const chainId = publicClient.chain?.id;
  const account = walletClient.account?.address;

  if (!isSupportedParentChainId(chainId)) {
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

  return {
    txHash: txReceipt.transactionHash,
    txReceipt,
  };
}
