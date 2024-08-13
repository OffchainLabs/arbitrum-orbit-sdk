import { parseEther, zeroAddress } from 'viem';

import { getWasmModuleRoot } from './wasmModuleRoot';

export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot: getWasmModuleRoot(20),
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
} as const;
