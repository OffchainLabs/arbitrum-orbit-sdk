import { Chain, Client, Transport, parseEther } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { validateParentChain } from './types/ParentChain';
import { Prettify } from './types/utils';
import { getWethAddress } from './utils';

import { createRollup } from './createRollup';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';

import { defaults } from './createRollupPrepareDeploymentParamsConfigDefaults';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';
import {
  SequencerInboxMaxTimeVariation,
  getDefaultSequencerInboxMaxTimeVariation,
} from './getDefaultSequencerInboxMaxTimeVariation';

export type CreateRollupPrepareDeploymentParamsConfigResult =
  CreateRollupFunctionInputs[0]['config'];

type RequiredKeys = 'chainId' | 'owner';
type RequiredParams = Pick<CreateRollupPrepareDeploymentParamsConfigResult, RequiredKeys>;
type OptionalParams = Partial<
  Omit<CreateRollupPrepareDeploymentParamsConfigResult, 'chainConfig' | RequiredKeys>
>;

export type CreateRollupPrepareDeploymentParamsConfigParams = Prettify<
  RequiredParams & { chainConfig?: ChainConfig } & OptionalParams
>;

/**
 * Creates the configuration object to be used with {@link createRollup}.
 *
 * @param {PublicClient} client Parent chain client
 * @param {Object} params Chain configuration parameters
 * @see https://docs.arbitrum.io/launch-orbit-chain/how-tos/customize-deployment-configuration
 * @see https://docs.arbitrum.io/launch-orbit-chain/reference/additional-configuration-parameters
 * @param {string} params.owner
 * @param {BigInt} params.chainId
 * @param {ChainConfig} [params.chainConfig]
 * @param {BigInt} [params.confirmPeriodBlocks]
 * @param {BigInt} [params.extraChallengeTimeBlocks]
 * @param {string} [params.stakeToken]
 * @param {BigInt} [params.baseStake]
 * @param {string} [params.wasmModuleRoot]
 * @param {string} [params.loserStakeEscrow]
 * @param {BigInt} [params.genesisBlockNum]
 * @param {Object} [params.sequencerInboxMaxTimeVariation]
 * @param {BigInt} [params.sequencerInboxMaxTimeVariation.delayBlocks]
 * @param {BigInt} [params.sequencerInboxMaxTimeVariation.futureBlocks]
 * @param {BigInt} [params.sequencerInboxMaxTimeVariation.delaySeconds]
 * @param {BigInt} [params.sequencerInboxMaxTimeVariation.futureSeconds]
 *
 * @returns {Object} {@link CreateRollupPrepareDeploymentParamsConfigResult}
 *
 * @example
 * const config = createRollupPrepareDeploymentParamsConfig(parentPublicClient, {
 *   chainId: BigInt(chainId),
 *   owner: deployer.address,
 *   chainConfig: prepareChainConfig({
 *     chainId,
 *     arbitrum: {
 *       InitialChainOwner: deployer.address,
 *       DataAvailabilityCommittee: true,
 *     },
 *   }),
 * });
 */
export function createRollupPrepareDeploymentParamsConfig<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  {
    chainConfig,
    confirmPeriodBlocks,
    sequencerInboxMaxTimeVariation,
    ...params
  }: CreateRollupPrepareDeploymentParamsConfigParams,
): CreateRollupPrepareDeploymentParamsConfigResult {
  const { chainId: parentChainId, isCustom: parentChainIsCustom } = validateParentChain(client);

  let paramsByParentBlockTime: {
    confirmPeriodBlocks: bigint;
    sequencerInboxMaxTimeVariation: SequencerInboxMaxTimeVariation;
  };

  if (parentChainIsCustom) {
    if (typeof confirmPeriodBlocks === 'undefined') {
      throw new Error(
        `"params.confirmPeriodBlocks" must be provided when using a custom parent chain.`,
      );
    }

    if (typeof sequencerInboxMaxTimeVariation === 'undefined') {
      throw new Error(
        `"params.sequencerInboxMaxTimeVariation" must be provided when using a custom parent chain.`,
      );
    }

    paramsByParentBlockTime = {
      confirmPeriodBlocks,
      sequencerInboxMaxTimeVariation,
    };
  } else {
    const defaultConfirmPeriodBlocks = getDefaultConfirmPeriodBlocks(parentChainId);
    const defaultSequencerInboxMTV = getDefaultSequencerInboxMaxTimeVariation(parentChainId);

    paramsByParentBlockTime = {
      confirmPeriodBlocks: confirmPeriodBlocks ?? defaultConfirmPeriodBlocks,
      sequencerInboxMaxTimeVariation: sequencerInboxMaxTimeVariation ?? defaultSequencerInboxMTV,
    };
  }

  return {
    ...defaults,
    ...paramsByParentBlockTime,
    ...params,
    stakeToken: params.stakeToken ?? getWethAddress(client),
    baseStake: params.baseStake ?? parseEther(String(0.1)),
    // todo: nicer defaults, currently based on this
    // https://github.com/OffchainLabs/nitro-contracts/pull/312/files#diff-9f526a29af0fe82b358ec76bde5921666dca4b51d1d7ee1bc7bfbe1251032107
    minimumAssertionPeriod: BigInt(75),
    validatorAfkBlocks: BigInt(201600),
    miniStakeValues: [BigInt(4), BigInt(2), BigInt(1)],
    layerZeroBlockEdgeHeight: BigInt(2 ** 5),
    layerZeroBigStepEdgeHeight: BigInt(2 ** 5),
    layerZeroSmallStepEdgeHeight: BigInt(2 ** 5),
    numBigStepLevel: 1,
    challengeGracePeriodBlocks: BigInt(10),
    bufferConfig: {
      threshold: BigInt(600),
      max: BigInt(14400),
      replenishRateInBasis: BigInt(500),
    },
    // default to chain owner if not provided
    loserStakeEscrow: params.loserStakeEscrow ?? params.owner,
    chainConfig: JSON.stringify(
      chainConfig ??
        prepareChainConfig({
          chainId: Number(params.chainId),
          arbitrum: { InitialChainOwner: params.owner },
        }),
    ),
  };
}
