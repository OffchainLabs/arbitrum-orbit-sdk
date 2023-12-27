import { PublicClient } from 'viem';
import { chains } from '../chains';

export type ParentChain = (typeof chains)[number];
export type ParentChainId = ParentChain['id'];

export function validParentChainId(
  parentChainId: number | undefined,
): parentChainId is ParentChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(parentChainId));
}

export const validateParentChainId = (client: PublicClient): ParentChainId => {
  const chainId = client.chain?.id;
  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }
  return chainId;
};
