import { Address, PublicClient, Transport, Chain, encodeFunctionData, zeroAddress } from 'viem';

import { defaults } from './createRollupDefaults';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { rollupCreatorABI } from './contracts/RollupCreator';
import { validateParentChain } from './types/ParentChain';
import { isCustomFeeTokenAddress } from './utils/isCustomFeeTokenAddress';
import { ChainConfig } from './types/ChainConfig';
import { isAnyTrustChainConfig } from './utils/isAnyTrustChainConfig';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { fetchDecimals } from './utils/erc20';
import { TransactionRequestGasOverrides, applyPercentIncrease } from './utils/gasOverrides';

import { Prettify } from './types/utils';
import {
  CreateRollupFunctionInputs,
  CreateRollupParams,
  WithRollupCreatorAddressOverride,
} from './types/createRollupTypes';
import { isKnownWasmModuleRoot, getConsensusReleaseByWasmModuleRoot } from './wasmModuleRoot';

function createRollupEncodeFunctionData(args: CreateRollupFunctionInputs) {
  return encodeFunctionData({
    abi: rollupCreatorABI,
    functionName: 'createRollup',
    args,
  });
}

export type CreateRollupPrepareTransactionRequestParams<TChain extends Chain | undefined> =
  Prettify<
    WithRollupCreatorAddressOverride<{
      params: CreateRollupParams;
      account: Address;
      value?: bigint;
      publicClient: PublicClient<Transport, TChain>;
      gasOverrides?: TransactionRequestGasOverrides;
    }>
  >;

export async function createRollupPrepareTransactionRequest<TChain extends Chain | undefined>({
  params,
  account,
  value,
  publicClient,
  gasOverrides,
  rollupCreatorAddressOverride,
}: CreateRollupPrepareTransactionRequestParams<TChain>) {
  const chainId = validateParentChain(publicClient);

  if (params.batchPosters.length === 0 || params.batchPosters.includes(zeroAddress)) {
    throw new Error(`"params.batchPosters" can't be empty or contain the zero address.`);
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

  const arbOSVersion = chainConfig.arbitrum.InitialArbOSVersion;
  const wasmModuleRoot = params.config.wasmModuleRoot;

  if (arbOSVersion === 30 || arbOSVersion === 31) {
    throw new Error(
      `ArbOS ${arbOSVersion} is not supported. Please set the ArbOS version to 32 or later by updating "arbitrum.InitialArbOSVersion" in your chain config.`,
    );
  }

  if (isKnownWasmModuleRoot(wasmModuleRoot)) {
    const consensusRelease = getConsensusReleaseByWasmModuleRoot(wasmModuleRoot);

    if (arbOSVersion > consensusRelease.maxArbOSVersion) {
      throw new Error(
        `Consensus v${consensusRelease.version} does not support ArbOS ${arbOSVersion}. Please update your "wasmModuleRoot" to that of a Consensus version compatible with ArbOS ${arbOSVersion}.`,
      );
    }
  }

  const maxDataSize = createRollupGetMaxDataSize(chainId);
  const batchPosterManager = params.batchPosterManager ?? zeroAddress;
  const paramsWithDefaults = { ...defaults, ...params, maxDataSize, batchPosterManager };
  const createRollupGetCallValueParams = { ...paramsWithDefaults, account };

  // @ts-ignore (todo: fix viem type issue)
  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    data: createRollupEncodeFunctionData([paramsWithDefaults]),
    value: value ?? (await createRollupGetCallValue(publicClient, createRollupGetCallValueParams)),
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
