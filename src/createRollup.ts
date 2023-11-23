import { PublicClient, WalletClient, GetFunctionArgs } from 'viem';

import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import {
  createRollupPrepareTransactionReceipt,
  CreateRollupTransactionReceipt,
} from './createRollupPrepareTransactionReceipt';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';

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

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (
    isCustomFeeTokenAddress(params.nativeToken) &&
    !isAnyTrustChainConfig(chainConfig)
  ) {
    throw new Error(`Custom fee token can only be used on AnyTrust chains`);
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);

  const { request } = await publicClient.simulateContract({
    address: rollupCreator.address[chainId],
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args: [{ ...defaults, ...params, maxDataSize }],
    value: createRollupGetCallValue(params),
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

  return createRollupPrepareTransactionReceipt(txReceipt);
}
