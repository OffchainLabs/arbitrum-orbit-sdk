import { parseEther, zeroAddress } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';

export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
  // todo: temp
  loserStakeEscrow: '0x000000000000000000000000000000000000dead',
  genesisBlockNum: BigInt(0),
} as const;
