import { PublicClient } from 'viem';
import { chains } from '../chains';

export type ParentChain = (typeof chains)[number];
export type ParentChainId = ParentChain['id'];

function isValidParentChainId(parentChainId: number | undefined): parentChainId is ParentChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(parentChainId));
}

export function validateParentChain(chainIdOrPublicClient: number | PublicClient): ParentChainId {
  const chainId =
    typeof chainIdOrPublicClient === 'number'
      ? chainIdOrPublicClient
      : chainIdOrPublicClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return chainId;
}
