import { PublicClient } from 'viem';

import { ParentChainId, validateParentChain } from './types/ParentChain';
import { parentChainIsMainnet } from './parentChainIsMainnet';

export function getDefaultConfirmPeriodBlocks(
  parentChainIdOrPublicClient: ParentChainId | PublicClient,
): bigint {
  const isMainnet = parentChainIsMainnet(validateParentChain(parentChainIdOrPublicClient));

  if (!isMainnet) {
    return 150n;
  }

  return 45_818n;
}
