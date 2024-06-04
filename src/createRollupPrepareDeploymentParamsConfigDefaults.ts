import { parseEther, zeroAddress } from 'viem';

/**
 * wasmModuleRoot is a hexadecimal string that represents the root of a
 * WebAssembly module.
 */
export const wasmModuleRoot: `0x${string}` =
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
  '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4';

/**
 * defaults includes default values for various parameters used in the
 * application, such as extra challenge time blocks, stake token, base stake
 * amount, wasm module root (a {@link string}), loser stake escrow, and genesis
 * block number.
 */
export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
} as const;
