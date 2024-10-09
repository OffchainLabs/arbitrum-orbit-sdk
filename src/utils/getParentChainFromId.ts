import { Chain, extractChain } from 'viem';

import { validateParentChain } from '../types/ParentChain';
import { chains } from '../chains';
import { customChains } from '../customChains';

export function getParentChainFromId(chainId: number): Chain {
  const { chainId: parentChainId } = validateParentChain(chainId);

  return extractChain({
    chains: [...chains, ...customChains],
    id: parentChainId,
  });
}
