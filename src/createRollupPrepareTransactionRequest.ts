import { Address, PublicClient, encodeFunctionData, zeroAddress } from 'viem';

import { CreateRollupParams } from './createRollup';
import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';

function createRollupEncodeFunctionData(
  params: CreateRollupParams & { maxDataSize: bigint }
) {
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

  if (params.batchPoster === zeroAddress) {
    throw new Error(`Param "batchPoster" can't be set to the zero address.`);
  }

  if (
    params.validators.length === 0 ||
    params.validators.includes(zeroAddress)
  ) {
    throw new Error(
      `Param "validators" can't be empty or contain the zero address.`
    );
  }

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (
    isCustomFeeTokenAddress(params.nativeToken) &&
    !isAnyTrustChainConfig(chainConfig)
  ) {
    throw new Error(
      `Param "nativeToken" can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`
    );
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreator.address[chainId],
    data: createRollupEncodeFunctionData({ ...params, maxDataSize }),
    value: createRollupGetCallValue(params),
    account,
  });

  return { ...request, chainId };
}
