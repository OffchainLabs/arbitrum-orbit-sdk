import * as chains from './chains';
import { ParentChainId } from './types/ParentChain';

/** 
 * Checks if the given {@link ParentChainId} is a mainnet chain or not. 
 *
 * @param {ParentChainId} parentChainId - The ID of the parent chain to check.
 * @returns {boolean} - Returns true if the parent chain is a mainnet chain, otherwise false.
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
