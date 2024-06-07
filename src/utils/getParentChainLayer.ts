import {
  mainnet,
  sepolia,
  holesky,
  nitroTestnodeL1,
  arbitrumOne,
  arbitrumNova,
  arbitrumSepolia,
  nitroTestnodeL2,
} from '../chains';
import { ParentChainId } from '../types/ParentChain';

/**
 * Get the layer of the parent chain based on its ID.
 *
 * @param {ParentChainId} parentChainId - The ID of the parent chain.
 * @returns {number} The layer of the parent chain (1 for L2, 2 for L3).
 */
export function getParentChainLayer(parentChainId: ParentChainId) {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    // L2 mainnet
    case mainnet.id:
    // L2 testnet
    case sepolia.id:
    case holesky.id:
    // L2 nitro-testnode
    case nitroTestnodeL1.id:
      return 1;

    // L3 mainnet
    case arbitrumOne.id:
    case arbitrumNova.id:
    // L3 testnet
    case arbitrumSepolia.id:
    // L3 nitro-testnode
    case nitroTestnodeL2.id:
      return 2;
  }
}
