import { rollupCreator } from '../contracts';
import { ParentChainId } from '../types/ParentChainId';

export function isSupportedParentChainId(
  parentChainId: number | undefined
): parentChainId is ParentChainId {
  return Object.keys(rollupCreator.address).includes(String(parentChainId));
}
