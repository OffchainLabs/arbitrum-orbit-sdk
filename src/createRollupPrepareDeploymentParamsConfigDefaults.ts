import { zeroAddress, zeroHash } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';
import { CreateRollupPrepareDeploymentParamsConfigResult as Config } from './createRollupPrepareDeploymentParamsConfig';

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

export const defaults = {
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
