import { parseEther, zeroAddress, zeroHash } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';
import { CreateRollupPrepareDeploymentParamsConfigResult as Config } from './createRollupPrepareDeploymentParamsConfig';

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
  baseStake: parseEther('1'),
  genesisAssertionState,
  genesisInboxCount: BigInt(0),
  miniStakeValues: [BigInt(0), BigInt(1), BigInt(1)],
  numBigStepLevel: 1,
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
} as const;
