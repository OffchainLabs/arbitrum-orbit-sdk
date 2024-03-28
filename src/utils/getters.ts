import { Chain, PublicClient } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChain } from '../types/ParentChain';

export function getRollupCreatorAddress(client: PublicClient) {
  const chainId = validateParentChain(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
}

export function getTokenBridgeCreatorAddress(client: PublicClient) {
  const chainId = validateParentChain(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
}

export function getBlockExplorerUrl(chain: Chain) {
  return chain.blockExplorers?.default.url;
}
