import {
  mainnet,
  sepolia,
  holesky,
  nitroTestnodeL1,
  arbitrumOne,
  arbitrumNova,
  arbitrumSepolia,
  nitroTestnodeL2,
} from './chains';
import { ParentChainId } from './types/ParentChain';

/**
 * Get the maximum data size for a rollup based on the parent chain ID.
 *
 * This function determines the maximum data size allowed for a rollup transaction
 * depending on the parent chain ID provided. It ensures that the correct data size
 * is returned for different environments such as mainnet, testnet, and nitro testnodes.
 *
 * @param {ParentChainId} parentChainId - The ID of the parent chain.
 * @returns {bigint} The maximum data size allowed for the rollup transaction.
 */
export function createRollupGetMaxDataSize(parentChainId: ParentChainId): bigint {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    // L2 mainnet
    case mainnet.id:
    // L2 testnet
    case sepolia.id:
    case holesky.id:
    // L2 nitro-testnode
    case nitroTestnodeL1.id:
      return BigInt(117_964);

    // L3 mainnet
    case arbitrumOne.id:
    case arbitrumNova.id:
    // L3 testnet
    case arbitrumSepolia.id:
    // L3 nitro-testnode
    case nitroTestnodeL2.id:
      return BigInt(104_857);
  }
}
