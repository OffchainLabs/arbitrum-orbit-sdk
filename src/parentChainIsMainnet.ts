import * as chains from './chains';
import { ParentChainId } from './types/ParentChain';

/**
 * Checks if the given parent chain ID corresponds to a mainnet chain.
 *
 * This function evaluates the parent chain ID and determines if it belongs
 * to one of the mainnet chains (e.g., Ethereum Mainnet, Arbitrum One, Arbitrum Nova).
 * It uses a switch statement to ensure exhaustive checking against all possible
 * `ParentChainId` values.
 *
 * @param {ParentChainId} parentChainId - The ID of the parent chain to check.
 * @returns {boolean} - Returns `true` if the parent chain ID is a mainnet chain, `false` otherwise.
 */
export function parentChainIsMainnet(parentChainId: ParentChainId): boolean {
  // doing switch here to make sure it's exhaustive when checking against `ParentChainId`
  switch (parentChainId) {
    case chains.mainnet.id:
    case chains.arbitrumOne.id:
    case chains.arbitrumNova.id:
      return true;

    case chains.sepolia.id:
    case chains.holesky.id:
    case chains.arbitrumSepolia.id:
    case chains.nitroTestnodeL1.id:
    case chains.nitroTestnodeL2.id:
      return false;
  }
}
