import { Client, Transport, Chain } from 'viem';

import { chains, nitroTestnodeL3 } from '../chains';
import { customChains } from '../customChains';

// exclude nitro-testnode L3 from the list of parent chains
export type ParentChain = Exclude<(typeof chains)[number], { id: typeof nitroTestnodeL3.id }>;
export type ParentChainId = ParentChain['id'];

function isCustomParentChain(chainId: number) {
  return customChains.map((chain) => chain.id).includes(chainId);
}

function isValidParentChainId<TCustom extends boolean = true>(
  parentChainId: number | undefined,
  options?: { custom?: TCustom },
): parentChainId is TCustom extends true ? number : ParentChainId {
  const defaultIds = chains
    // exclude nitro-testnode L3 from the list of parent chains
    .filter((chain) => chain.id !== nitroTestnodeL3.id)
    .map((chain) => chain.id) as Number[];

  // default to allowing custom parent chains
  const custom = options?.custom ?? true;
  const customIds = customChains.map((chain) => chain.id);

  if (!custom) {
    return defaultIds.includes(Number(parentChainId));
  }

  return [...defaultIds, ...customIds].includes(Number(parentChainId));
}

export function validateParentChain<
  TChain extends Chain | undefined,
  TCustom extends boolean = true,
>(
  chainIdOrClient: number | Client<Transport, TChain>,
  options?: { custom?: TCustom },
): TCustom extends true
  ? { chainId: number; isCustom: true } | { chainId: ParentChainId; isCustom: false }
  : { chainId: ParentChainId; isCustom: false } {
  const chainId = typeof chainIdOrClient === 'number' ? chainIdOrClient : chainIdOrClient.chain?.id;

  if (!isValidParentChainId(chainId)) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  // @ts-ignore
  return { chainId };
}
