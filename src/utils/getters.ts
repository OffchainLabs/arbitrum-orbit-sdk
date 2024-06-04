import { Client, Transport, Chain } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChain } from '../types/ParentChain';

/** Returns the address of the rollup creator for the specified chain. */
export function getRollupCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
}

/** Returns the address of the token bridge creator for the specified chain. */
export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
}

/** Returns the URL of the block explorer for a given {@link Chain}. */
export function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}
