import { extractChain } from 'viem';
import { ParentChain, isValidParentChainId } from '../types/ParentChain';
import { chains } from '../chains';

export function getParentChainFromId(chainId: number): ParentChain {
  // Just throws if the chainId is not valid
  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return extractChain({
    chains,
    id: chainId,
  }) as ParentChain;
}
