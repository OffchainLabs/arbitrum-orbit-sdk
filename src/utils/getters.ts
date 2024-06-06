import { Client, Transport, Chain } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChain } from '../types/ParentChain';

export function getRollupCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
}

export function getTokenBridgeCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
}

export function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}
