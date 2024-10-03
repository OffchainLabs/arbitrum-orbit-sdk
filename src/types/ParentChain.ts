import { Client, Transport, Chain } from 'viem';

import { chains, nitroTestnodeL3 } from '../chains';

// exclude nitro-testnode L3 from the list of parent chains
export type ParentChain = Exclude<(typeof chains)[number], { id: typeof nitroTestnodeL3.id }>;
export type ParentChainId = ParentChain['id'];

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
