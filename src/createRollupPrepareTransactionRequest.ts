import { Address, encodeFunctionData } from 'viem';

import { CreateRollupFunctionInputs, CreateRollupParams } from './createRollup';
import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { rollupCreator } from './contracts';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';
import { OrbitClient } from './orbitClient';

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
  orbitClient,
}: {
  params: CreateRollupParams;
  account: Address;
  orbitClient: OrbitClient;
}) {
  const chainId = orbitClient.getValidChainId();

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (isCustomFeeTokenAddress(params.nativeToken) && !isAnyTrustChainConfig(chainConfig)) {
    throw new Error(
      `Custom fee token can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`,
    );
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);
  const paramsWithDefaults = { ...defaults, ...params, maxDataSize };

  const request = await orbitClient.prepareTransactionRequest({
    chain: orbitClient.chain,
    to: orbitClient.getRollupCreatorAddress(),
    data: createRollupEncodeFunctionData([paramsWithDefaults]),
    value: createRollupGetCallValue(paramsWithDefaults),
    account,
  });

  return { ...request, chainId };
}
