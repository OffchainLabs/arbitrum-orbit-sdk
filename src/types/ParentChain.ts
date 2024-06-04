import { Client, PublicClient, Transport, Chain } from 'viem';

import { chains, nitroTestnodeL3 } from '../chains';
import { Prettify } from './utils';

// exclude nitro-testnode L3 from the list of parent chains
export type ParentChain = Exclude<(typeof chains)[number], { id: typeof nitroTestnodeL3.id }>;
export type ParentChainId = ParentChain['id'];

export type ParentChainPublicClient<TChain extends Chain | undefined> = Prettify<
  Omit<PublicClient<Transport, TChain>, 'chain'> & {
    chain: Prettify<Omit<Chain, 'id'> & { id: ParentChainId }>;
  }
>;

function isValidParentChainId(parentChainId: number | undefined): parentChainId is ParentChainId {
  const ids = chains
    // exclude nitro-testnode L3 from the list of parent chains
    .filter((chain) => chain.id !== nitroTestnodeL3.id)
    .map((chain) => chain.id) as Number[];
  return ids.includes(Number(parentChainId));
}

export function validateParentChain<TChain extends Chain | undefined>(
  chainIdOrClient: number | Client<Transport, TChain>,
): ParentChainId {
  const chainId = typeof chainIdOrClient === 'number' ? chainIdOrClient : chainIdOrClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return chainId;
}

export function validateParentChainPublicClient<TChain extends Chain | undefined>(
  publicClient: PublicClient<Transport, TChain>,
): ParentChainPublicClient<TChain> {
  const chainId = publicClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return publicClient as ParentChainPublicClient<TChain>;
}
