import { extractChain } from 'viem';

import { ParentChain, isValidParentChainId } from '../types/ParentChain';

import { chains } from '../chains';
import { customChains } from '../customChains';

export function getParentChainFromId(chainId: number): ParentChain {
  // Just throws if the chainId is not valid
  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return extractChain({
    chains: [...chains, ...customChains],
    id: chainId,
  }) as ParentChain;
}
