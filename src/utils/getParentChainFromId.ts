import { extractChain } from 'viem';

import { ParentChain, validateParentChain } from '../types/ParentChain';
import { chains } from '../chains';
import { customChains } from '../customChains';

export function getParentChainFromId(chainId: number): ParentChain {
  const parentChainId = validateParentChain(chainId);

  return extractChain({
    chains: [...chains, ...customChains],
    id: parentChainId,
  }) as ParentChain;
}
