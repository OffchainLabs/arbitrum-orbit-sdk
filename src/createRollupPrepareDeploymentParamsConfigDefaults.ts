import { parseEther, zeroAddress } from 'viem';

/**
 * wasmModuleRoot is a hexadecimal string representing the root hash of a
 * WebAssembly module.
 */
export const wasmModuleRoot: `0x${string}` =
  // https://github.com/OffchainLabs/nitro/releases/tag/consensus-v20
  '0x8b104a2e80ac6165dc58b9048de12f301d70b02a0ab51396c22b4b4b802a16a4';

/**
 * defaults defines the default values for various parameters used in the
 * preparation of deployment configuration. It includes
 * extraChallengeTimeBlocks, stakeToken, baseStake, wasmModuleRoot,
 * loserStakeEscrow, and genesisBlockNum.
 *
 * @property {bigint} defaults.extraChallengeTimeBlocks - The additional challenge time blocks.
 * @property {string} defaults.stakeToken - The address of the stake token.
 * @property {bigint} defaults.baseStake - The base stake amount in wei.
 * @property {`0x${string}`} defaults.wasmModuleRoot - The root hash of the WebAssembly module.
 * @property {string} defaults.loserStakeEscrow - The address of the loser stake escrow.
 * @property {bigint} defaults.genesisBlockNum - The genesis block number.
 */
export const defaults = {
  extraChallengeTimeBlocks: BigInt(0),
  stakeToken: zeroAddress,
  baseStake: parseEther(String(0.1)),
  wasmModuleRoot,
  loserStakeEscrow: zeroAddress,
  genesisBlockNum: BigInt(0),
} as const;
