import { ChainConfig } from './types/ChainConfig';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';
import { defaults as defaultsCommon } from './createRollupPrepareDeploymentParamsConfigDefaults';
// importing for jsdoc @link to work
import { createRollupPrepareDeploymentParamsConfig } from './createRollupPrepareDeploymentParamsConfig';
import { Prettify } from './types/utils';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

...

/**
 * Prepares the configuration for creating a Rollup deployment.
 *
 * @deprecated Will be removed in a future release. Please use {@link createRollupPrepareDeploymentParamsConfig} instead.
 *
 * @param {CreateRollupPrepareConfigParams} createRollupPrepareConfigParams - The parameters for preparing the Rollup config
 * @param {ChainConfig} [createRollupPrepareConfigParams.chainConfig] - Optional chain configuration
 * @param {bigint} createRollupPrepareConfigParams.chainId - The chain ID
 * @param {string} createRollupPrepareConfigParams.owner - The owner of the chain
 * @param {number} [createRollupPrepareConfigParams.confirmPeriodBlocks=150] - Optional, defaults to 150
 * @param {Object} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation] - Optional, default values provided
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.delayBlocks=5760] - Optional, defaults to 5760
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.futureBlocks=48] - Optional, defaults to 48
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.delaySeconds=86400] - Optional, defaults to 86400
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.futureSeconds=3600] - Optional, defaults to 3600
 *
 * @returns {CreateRollupPrepareConfigResult} - The prepared Rollup configuration
 *
 * @example
 * const config = createRollupPrepareConfig({
 *   chainId: 1234n,
 *   owner: '0xYourAddress',
 * });
 * console.log(config);
 */
export function createRollupPrepareConfig({
  chainConfig,
  ...params
}: CreateRollupPrepareConfigParams): CreateRollupPrepareConfigResult {
  return {
    ...defaults,
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
