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
