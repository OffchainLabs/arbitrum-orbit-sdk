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

export type CreateRollupPrepareDeploymentParamsConfigResult =
  CreateRollupFunctionInputs[0]['config'];

/**
 * @typedef {Object} CreateRollupPrepareDeploymentParamsConfigParams
 * @property {BigInt} chainId - The chain ID
 * @property {string} owner - The owner of the chain
 * @property {ChainConfig} [chainConfig] - Optional chain configuration
 * @property {BigInt} [confirmPeriodBlocks] - Optional confirmation period blocks
 * @property {BigInt} [extraChallengeTimeBlocks] - Optional extra challenge time blocks
 * @property {string} [stakeToken] - Optional stake token
 * @property {BigInt} [baseStake] - Optional base stake
 * @property {string} [wasmModuleRoot] - Optional WASM module root
 * @property {string} [loserStakeEscrow] - Optional loser stake escrow
 * @property {BigInt} [genesisBlockNum] - Optional genesis block number
 * @property {Object} [sequencerInboxMaxTimeVariation] - Optional sequencer inbox max time variation
 * @property {BigInt} [sequencerInboxMaxTimeVariation.delayBlocks] - Optional delay blocks for sequencer inbox
 * @property {BigInt} [sequencerInboxMaxTimeVariation.futureBlocks] - Optional future blocks for sequencer inbox
 * @property {BigInt} [sequencerInboxMaxTimeVariation.delaySeconds] - Optional delay seconds for sequencer inbox
 * @property {BigInt} [sequencerInboxMaxTimeVariation.futureSeconds] - Optional future seconds for sequencer inbox
 */

/**
 * Creates the configuration object to be used with {@link createRollup}.
 *
 * @param {Client} client - Parent chain client
 * @param {CreateRollupPrepareDeploymentParamsConfigParams} params - Chain configuration parameters
 * @returns {CreateRollupPrepareDeploymentParamsConfigResult} - The configuration object to be used with createRollup
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
export function createRollupPrepareDeploymentParamsConfig<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>(
  client: Client<TTransport, TChain>,
  { chainConfig, ...params }: CreateRollupPrepareDeploymentParamsConfigParams,
): CreateRollupPrepareDeploymentParamsConfigResult {
  const parentChainId = validateParentChain(client);

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

// Define the required and optional parameters separately
type RequiredKeys = 'chainId' | 'owner';
type RequiredParams = Pick<CreateRollupPrepareDeploymentParamsConfigResult, RequiredKeys>;
type OptionalParams = Partial<
  Omit<CreateRollupPrepareDeploymentParamsConfigResult, 'chainConfig' | RequiredKeys>
>;

// Combine required and optional parameters into a single type
export type CreateRollupPrepareDeploymentParamsConfigParams = Prettify<
  RequiredParams & { chainConfig?: ChainConfig } & OptionalParams
>;
