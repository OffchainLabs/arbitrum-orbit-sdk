import { extractChain } from 'viem';

import { chains } from '../chains';
import { ParentChain, validateParentChain } from '../types/ParentChain';

export function getParentChainFromId(chainId: number): ParentChain {
  const parentChainId = validateParentChain(chainId);

  return extractChain({
    chains,
    id: parentChainId,
  }) as ParentChain;
}
