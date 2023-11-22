import { sepolia } from './chains';
import { ParentChainId } from './types/ParentChain';

export function createRollupGetMaxDataSize(parentChainId: ParentChainId) {
  // L2
  if (parentChainId === sepolia.id) {
    return BigInt(117_964);
  }

  // L3
  return BigInt(104_857);
}
