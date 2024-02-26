import { Address, PublicClient, encodeFunctionData, zeroAddress } from 'viem';

import { CreateRollupFunctionInputs, CreateRollupParams } from './createRollup';
import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { rollupCreator } from './contracts';
import { validParentChainId } from './types/ParentChain';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';
import { fetchDecimals } from './utils/erc20';
import { TransactionRequestGasOverrides, applyPercentIncrease } from './utils/gasOverrides';
import { WithRollupCreatorAddressOverride } from './createRollupTypes';

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
  gasOverrides,
  rollupCreatorAddressOverride,
}: WithRollupCreatorAddressOverride<{
  params: CreateRollupParams;
  account: Address;
  publicClient: PublicClient;
  gasOverrides?: TransactionRequestGasOverrides;
}>) {
  const chainId = publicClient.chain?.id;

  if (!validParentChainId(chainId)) {
    throw new Error(`"publicClient.chain" can't be undefined.`);
  }

  if (params.batchPoster === zeroAddress) {
    throw new Error(`"params.batchPoster" can't be set to the zero address.`);
  }

  if (params.validators.length === 0 || params.validators.includes(zeroAddress)) {
    throw new Error(`"params.validators" can't be empty or contain the zero address.`);
  }

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (isCustomFeeTokenAddress(params.nativeToken)) {
    // custom fee token is only allowed for anytrust chains
    if (!isAnyTrustChainConfig(chainConfig)) {
      throw new Error(
        `"params.nativeToken" can only be used on AnyTrust chains. Set "arbitrum.DataAvailabilityCommittee" to "true" in the chain config.`,
      );
    }

    // custom fee token is only allowed to have 18 decimals
    if ((await fetchDecimals({ address: params.nativeToken, publicClient })) !== 18) {
      throw new Error(
        `"params.nativeToken" can only be configured with a token that uses 18 decimals.`,
      );
    }
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);
  const paramsWithDefaults = { ...defaults, ...params, maxDataSize };

  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreatorAddressOverride ?? rollupCreator.address[chainId],
    data: createRollupEncodeFunctionData([paramsWithDefaults]),
    value: createRollupGetCallValue(paramsWithDefaults),
    account,
    // if the base gas limit override was provided, hardcode gas to 0 to skip estimation
    // we'll set the actual value in the code below
    gas: typeof gasOverrides?.gasLimit?.base !== 'undefined' ? 0n : undefined,
  });

  // potential gas overrides (gas limit)
  if (gasOverrides && gasOverrides.gasLimit) {
    request.gas = applyPercentIncrease({
      // the ! is here because we should let it error in case we don't have the estimated gas
      base: gasOverrides.gasLimit.base ?? request.gas!,
      percentIncrease: gasOverrides.gasLimit.percentIncrease,
    });
  }

  return { ...request, chainId };
}
