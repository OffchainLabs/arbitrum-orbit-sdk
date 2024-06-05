import { parseEther, zeroAddress } from 'viem';

import { ChainConfig } from './types/ChainConfig';
import { CreateRollupFunctionInputs } from './types/createRollupTypes';
import { prepareChainConfig } from './prepareChainConfig';
import { Prettify } from './types/utils';

export type CreateRollupPrepareConfigResult = CreateRollupFunctionInputs[0]['config'];

/**
 * Required keys for the rollup configuration.
 * @typedef {Object} RequiredKeys
 * @property {bigint} chainId - The chain ID.
 * @property {string} owner - The owner address.
 */
type RequiredKeys = 'chainId' | 'owner';

type RequiredParams = Pick<CreateRollupPrepareConfigResult, RequiredKeys>;
type OptionalParams = Partial<Omit<CreateRollupPrepareConfigResult, 'chainConfig' | RequiredKeys>>;

/**
 * Parameters for creating a rollup configuration.
 * @typedef {Object} CreateRollupPrepareConfigParams
 * @property {RequiredParams} RequiredParams - The required parameters.
 * @property {OptionalParams} OptionalParams - The optional parameters.
 * @property {ChainConfig} [chainConfig] - The chain configuration.
 */
export type CreateRollupPrepareConfigParams = Prettify<
  RequiredParams & { chainConfig?: ChainConfig } & OptionalParams
>;

const wasmModuleRoot: `0x${string}` =
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
  '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4';

/**
 * Default values for the rollup configuration.
 * @constant {Object} defaults
 * @property {bigint} confirmPeriodBlocks - The confirmation period in blocks.
 * @property {bigint} extraChallengeTimeBlocks - The extra challenge time in blocks.
 * @property {string} stakeToken - The stake token address.
 * @property {bigint} baseStake - The base stake amount.
 * @property {string} wasmModuleRoot - The WASM module root.
 * @property {string} loserStakeEscrow - The loser stake escrow address.
 * @property {bigint} genesisBlockNum - The genesis block number.
 * @property {Object} sequencerInboxMaxTimeVariation - The sequencer inbox max time variation.
 * @property {bigint} sequencerInboxMaxTimeVariation.delayBlocks - The delay in blocks.
 * @property {bigint} sequencerInboxMaxTimeVariation.futureBlocks - The future blocks.
 * @property {bigint} sequencerInboxMaxTimeVariation.delaySeconds - The delay in seconds.
 * @property {bigint} sequencerInboxMaxTimeVariation.futureSeconds - The future seconds.
 */
export const defaults = {
  confirmPeriodBlocks: BigInt(150),
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
  sequencerInboxMaxTimeVariation: {
    delayBlocks: BigInt(5_760),
    futureBlocks: BigInt(48),
    delaySeconds: BigInt(86_400),
    futureSeconds: BigInt(3_600),
  },
};

/**
 * Prepares the rollup configuration.
 *
 * @param {CreateRollupPrepareConfigParams} createRollupPrepareConfigParams - The parameters for creating the rollup configuration.
 * @param {ChainConfig} [createRollupPrepareConfigParams.chainConfig] - The chain configuration.
 * @param {bigint} createRollupPrepareConfigParams.chainId - The chain ID.
 * @param {string} createRollupPrepareConfigParams.owner - The owner address.
 * @param {bigint} [createRollupPrepareConfigParams.confirmPeriodBlocks=150] - The confirmation period in blocks.
 * @param {bigint} [createRollupPrepareConfigParams.extraChallengeTimeBlocks=0] - The extra challenge time in blocks.
 * @param {string} [createRollupPrepareConfigParams.stakeToken=zeroAddress] - The stake token address.
 * @param {bigint} [createRollupPrepareConfigParams.baseStake=parseEther(String(0.1))] - The base stake amount.
 * @param {string} [createRollupPrepareConfigParams.wasmModuleRoot=wasmModuleRoot] - The WASM module root.
 * @param {string} [createRollupPrepareConfigParams.loserStakeEscrow=zeroAddress] - The loser stake escrow address.
 * @param {bigint} [createRollupPrepareConfigParams.genesisBlockNum=0] - The genesis block number.
 * @param {Object} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation] - The sequencer inbox max time variation.
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.delayBlocks=5_760] - The delay in blocks.
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.futureBlocks=48] - The future blocks.
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.delaySeconds=86_400] - The delay in seconds.
 * @param {bigint} [createRollupPrepareConfigParams.sequencerInboxMaxTimeVariation.futureSeconds=3_600] - The future seconds.
 * @returns {CreateRollupPrepareConfigResult} The prepared rollup configuration.
 *
 * @example
 * const rollupConfig = createRollupPrepareConfig({
 *   chainId: BigInt(123),
 *   owner: '0xYourAddress',
 * });
 *
 * console.log(rollupConfig);
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
