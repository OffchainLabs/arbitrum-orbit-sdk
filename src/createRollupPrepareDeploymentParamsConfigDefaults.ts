import { parseEther, zeroAddress } from 'viem';

import { getConsensusReleaseByVersion } from './wasmModuleRoot';

export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  // todo: temp, hardcoded to arb sepolia weth
  stakeToken: '0x980b62da83eff3d4576c647993b0c1d7faf17c73',
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getConsensusReleaseByVersion(32).wasmModuleRoot,
  // todo: temp
  loserStakeEscrow: '0x000000000000000000000000000000000000dead',
  genesisBlockNum: BigInt(0),
} as const;
