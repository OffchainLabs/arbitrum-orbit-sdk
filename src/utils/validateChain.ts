import { Client, Transport, Chain } from 'viem';

import { chains } from '../chains';

type ChainId = (typeof chains)[number]['id'];

function isValidChainId(chainId: number | undefined): chainId is ChainId {
  const ids = chains.map((chain) => chain.id) as Number[];
  return ids.includes(Number(chainId));
}

/**
 * Validates the provided chain ID or client and ensures that it is supported by
 * the system. Returns a {@link ChainId}.
 */
export function validateChain<TChain extends Chain | undefined>(
  chainIdOrClient: number | Client<Transport, TChain>,
): ChainId {
  const chainId = typeof chainIdOrClient === 'number' ? chainIdOrClient : chainIdOrClient.chain?.id;

  if (!isValidChainId(chainId)) {
    throw new Error(`Chain not supported: ${chainId}`);
  }

  return chainId;
}
