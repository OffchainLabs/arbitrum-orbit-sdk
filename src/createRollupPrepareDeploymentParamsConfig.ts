import { Chain, Client, Transport } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { validateParentChain } from './types/ParentChain';
import { Prettify } from './types/utils';

import { createRollup } from './createRollup';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';

import { defaults } from './createRollupPrepareDeploymentParamsConfigDefaults';
import { getDefaultConfirmPeriodBlocks } from './getDefaultConfirmPeriodBlocks';
import { getDefaultSequencerInboxMaxTimeVariation } from './getDefaultSequencerInboxMaxTimeVariation';
import { isCustomParentChain } from './customChains';

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
  { chainConfig, ...params }: CreateRollupPrepareDeploymentParamsConfigParams,
): CreateRollupPrepareDeploymentParamsConfigResult {
  const parentChainId = validateParentChain(client);

  if (isCustomParentChain(client) && typeof params.confirmPeriodBlocks === 'undefined') {
    throw new Error(
      `"params.confirmPeriodBlocks" must be provided when using a custom parent chain.`,
    );
  }

  if (isCustomParentChain(client) && typeof params.sequencerInboxMaxTimeVariation === 'undefined') {
    throw new Error(
      `"params.sequencerInboxMaxTimeVariation" must be provided when using a custom parent chain.`,
    );
  }

  const defaultsBasedOnParentChain = {
    confirmPeriodBlocks: getDefaultConfirmPeriodBlocks(parentChainId),
    sequencerInboxMaxTimeVariation: getDefaultSequencerInboxMaxTimeVariation(parentChainId),
  };

  return {
    ...defaults,
    ...defaultsBasedOnParentChain,
    ...params,
    chainConfig: JSON.stringify(
      chainConfig ??
        prepareChainConfig({
          chainId: Number(params.chainId),
          arbitrum: { InitialChainOwner: params.owner },
        }),
    ),
  };
}
