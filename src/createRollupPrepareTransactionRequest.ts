import { Address, PublicClient, Transport, Chain, encodeFunctionData, zeroAddress } from 'viem';

import { defaults } from './createRollupDefaults';
import { createRollupEncodeFunctionData } from './createRollupEncodeFunctionData';
import { createRollupGetCallValue } from './createRollupGetCallValue';
import { createRollupGetMaxDataSize } from './createRollupGetMaxDataSize';
import { validateParentChain } from './types/ParentChain';
import { isNonZeroAddress } from './utils/isNonZeroAddress';
import { ChainConfig } from './types/ChainConfig';
import { getRollupCreatorAddress } from './utils/getRollupCreatorAddress';
import { fetchDecimals } from './utils/erc20';
import { TransactionRequestGasOverrides, applyPercentIncrease } from './utils/gasOverrides';

import { Prettify } from './types/utils';
import { CreateRollupParams } from './types/createRollupTypes';
import { isKnownWasmModuleRoot, getConsensusReleaseByWasmModuleRoot } from './wasmModuleRoot';

export type CreateRollupPrepareTransactionRequestParams<TChain extends Chain | undefined> =
  Prettify<{
    params: CreateRollupParams;
    account: Address;
    value?: bigint;
    publicClient: PublicClient<Transport, TChain>;
    gasOverrides?: TransactionRequestGasOverrides;
    rollupCreatorAddressOverride?: Address;
  }>;

export async function createRollupPrepareTransactionRequest<TChain extends Chain | undefined>({
  params,
  account,
  value,
  publicClient,
  gasOverrides,
  rollupCreatorAddressOverride,
}: CreateRollupPrepareTransactionRequestParams<TChain>) {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } =
    validateParentChain(publicClient);

  if (params.batchPosters.length === 0 || params.batchPosters.includes(zeroAddress)) {
    throw new Error(`"params.batchPosters" can't be empty or contain the zero address.`);
  }

  if (params.validators.length === 0 || params.validators.includes(zeroAddress)) {
    throw new Error(`"params.validators" can't be empty or contain the zero address.`);
  }

  const chainConfig: ChainConfig = JSON.parse(params.config.chainConfig);

  if (isNonZeroAddress(params.nativeToken)) {
    const isRollupChain = chainConfig.arbitrum.DataAvailabilityCommittee === false;
    const isFeeTokenPricerMissing = !isNonZeroAddress(params.feeTokenPricer);

    // fee token pricer is mandatory for custom gas token rollup chains
    if (isRollupChain && isFeeTokenPricerMissing) {
      throw new Error(
        `"params.feeTokenPricer" must be provided for a custom gas token rollup chain.`,
      );
    }

    if ((await fetchDecimals({ address: params.nativeToken, publicClient })) > 36) {
      throw new Error(
        `"params.nativeToken" can only be configured with a token that uses 36 decimals or less.`,
      );
    }
  }

  let maxDataSize: bigint;

  if (parentChainIsCustom) {
    if (typeof params.maxDataSize === 'undefined') {
      throw new Error(`"params.maxDataSize" must be provided when using a custom parent chain.`);
    }

    maxDataSize = params.maxDataSize;
  } else {
    maxDataSize = params.maxDataSize ?? createRollupGetMaxDataSize(parentChainId);
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

  const paramsWithDefaults = { ...defaults, ...params, maxDataSize };
  const createRollupGetCallValueParams = { ...paramsWithDefaults, account };

  // @ts-ignore (todo: fix viem type issue)
  const request = await publicClient.prepareTransactionRequest({
    chain: publicClient.chain,
    to: rollupCreatorAddressOverride ?? getRollupCreatorAddress(publicClient),
    data: createRollupEncodeFunctionData({ args: [paramsWithDefaults] }),
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

  return { ...request, chainId: parentChainId };
}
