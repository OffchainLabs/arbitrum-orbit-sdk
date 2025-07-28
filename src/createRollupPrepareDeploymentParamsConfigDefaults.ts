import { zeroAddress, zeroHash, parseEther } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';
import { CreateRollupPrepareDeploymentParamsConfigResult as Config } from './createRollupPrepareDeploymentParamsConfig';

const defaultsV2Dot1 = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
} as const;

const bufferConfig: Config['bufferConfig'] = {
  threshold: BigInt(2 ** 32),
  max: BigInt(2 ** 32),
  replenishRateInBasis: BigInt(500),
};

const genesisAssertionState: Config['genesisAssertionState'] = {
  globalState: {
    bytes32Vals: [zeroHash, zeroHash],
    u64Vals: [BigInt(0), BigInt(0)],
  },
  machineStatus: 1,
  endHistoryRoot: zeroHash,
} as const;

const defaultsV3Dot1 = {
  anyTrustFastConfirmer: zeroAddress,
  bufferConfig,
  genesisAssertionState,
  genesisInboxCount: BigInt(0),
  layerZeroBlockEdgeHeight: BigInt(2 ** 26),
  layerZeroBigStepEdgeHeight: BigInt(2 ** 19),
  layerZeroSmallStepEdgeHeight: BigInt(2 ** 23),
  numBigStepLevel: 1,
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
} as const;

export function createRollupPrepareDeploymentParamsConfigDefaults(
  rollupCreatorVersion: 'v2.1',
): typeof defaultsV2Dot1;
export function createRollupPrepareDeploymentParamsConfigDefaults(
  rollupCreatorVersion: 'v3.1',
): typeof defaultsV3Dot1;
export function createRollupPrepareDeploymentParamsConfigDefaults(
  rollupCreatorVersion?: never,
): typeof defaultsV3Dot1;
export function createRollupPrepareDeploymentParamsConfigDefaults(
  rollupCreatorVersion: 'v3.1' | 'v2.1' = 'v3.1',
) {
  if (rollupCreatorVersion === 'v2.1') {
    return defaultsV2Dot1;
  }

  return defaultsV3Dot1;
}
