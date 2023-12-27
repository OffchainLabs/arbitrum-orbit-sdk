import { WalletClient, GetFunctionArgs } from 'viem';

import { rollupCreator } from './contracts';
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
import type { OrbitClient } from './orbitClient';

export type CreateRollupFunctionInputs = GetFunctionArgs<
  typeof rollupCreator.abi,
  'createRollup'
>['args'];

type RequiredKeys = 'config' | 'batchPoster' | 'validators';

export type CreateRollupParams = Pick<CreateRollupFunctionInputs[0], RequiredKeys> &
  Partial<Omit<CreateRollupFunctionInputs[0], RequiredKeys>>;

export async function createRollup({
  params,
  orbitClient,
  walletClient,
}: {
  params: CreateRollupParams;
  orbitClient: OrbitClient;
  walletClient: WalletClient;
}): Promise<CreateRollupTransactionReceipt> {
  const chainId = orbitClient.getValidChainId();
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

  const { request } = await orbitClient.simulateContract({
    address: orbitClient.getRollupCreatorAddress(),
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args: [paramsWithDefaults],
    value: createRollupGetCallValue(paramsWithDefaults),
    account,
  });

  const hash = await walletClient.writeContract(request);
  const txReceipt = await orbitClient.waitForTransactionReceipt({ hash });

  return createRollupPrepareTransactionReceipt(txReceipt);
}
