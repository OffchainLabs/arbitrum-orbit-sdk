import { PublicClient, WalletClient, GetFunctionArgs } from 'viem';

import { rollupCreator } from './contracts';
import { validateParentChainId } from './types/ParentChain';
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

export type CreateRollupFunctionInputs = GetFunctionArgs<
  typeof rollupCreator.abi,
  'createRollup'
>['args'];

type RequiredKeys = 'config' | 'batchPoster' | 'validators';

export type CreateRollupParams = Pick<CreateRollupFunctionInputs[0], RequiredKeys> &
  Partial<Omit<CreateRollupFunctionInputs[0], RequiredKeys>>;

export async function createRollup({
  params,
  publicClient,
  walletClient,
}: {
  params: CreateRollupParams;
  publicClient: PublicClient;
  walletClient: WalletClient;
}): Promise<CreateRollupTransactionReceipt> {
  const chainId = validateParentChainId(publicClient);
  const account = walletClient.account?.address;

  if (typeof account === 'undefined') {
    throw new Error('account is undefined');
  }

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (isCustomFeeTokenAddress(params.nativeToken) && !isAnyTrustChainConfig(chainConfig)) {
    throw new Error(
      `Custom fee token can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`,
    );
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);
  const paramsWithDefaults = { ...defaults, ...params, maxDataSize };

  const { request } = await publicClient.simulateContract({
    address: rollupCreator.address[chainId],
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args: [paramsWithDefaults],
    value: createRollupGetCallValue(paramsWithDefaults),
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await publicClient.waitForTransactionReceipt({ hash });

  return createRollupPrepareTransactionReceipt(txReceipt);
}
