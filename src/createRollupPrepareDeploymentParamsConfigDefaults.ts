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
  extraChallengeTimeBlocks: BigInt(0),
  // todo: temp, hardcoded to arb sepolia weth
  stakeToken: '0x980b62da83eff3d4576c647993b0c1d7faf17c73',
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
  genesisBlockNum: BigInt(0),
  genesisInboxCount: BigInt(0),
  genesisAssertionState,
  anyTrustFastConfirmer: zeroAddress,
} as const;
