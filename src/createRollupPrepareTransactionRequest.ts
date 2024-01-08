import { Address, PublicClient, encodeFunctionData } from 'viem';

import { CreateRollupFunctionInputs, CreateRollupParams } from './createRollup';
import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';

function createRollupEncodeFunctionData(args: CreateRollupFunctionInputs) {
  return encodeFunctionData({
    abi: rollupCreator.abi,
    functionName: 'createRollup',
    args,
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

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (isCustomFeeTokenAddress(params.nativeToken) && !isAnyTrustChainConfig(chainConfig)) {
    throw new Error(
      `Custom fee token can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`,
    );
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);
  const paramsWithDefaults = { ...defaults, ...params, maxDataSize };

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreator.address[chainId],
    data: createRollupEncodeFunctionData([paramsWithDefaults]),
    value: createRollupGetCallValue(paramsWithDefaults),
    account,
  });

  return { ...request, chainId };
}
