import { parseEther, zeroAddress } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';

export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getConsensusReleaseByVersion(31).wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
} as const;
