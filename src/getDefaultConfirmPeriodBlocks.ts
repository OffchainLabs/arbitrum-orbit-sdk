import { ParentChainId } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';

export function getDefaultConfirmPeriodBlocks(parentChainId: ParentChainId): bigint {
  const isMainnet = parentChainIsMainnet(parentChainId);

  if (!isMainnet) {
    return 150n;
  }

  return 45_818n;
}
