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
 * Calculates and returns the maximum data size allowed for a given parent chain.
 *
 * This function determines the maximum data size for different chains such as mainnet,
 * testnet, and nitro-testnode, returning the appropriate value as a BigInt.
 *
 * @param {ParentChainId} parentChainId - The ID of the parent chain.
 * @returns {BigInt} - The maximum data size allowed for the specified parent chain.
 */
export function createRollupGetMaxDataSize(parentChainId: ParentChainId) {
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
