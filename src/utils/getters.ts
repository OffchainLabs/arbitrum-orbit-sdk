import { PublicClient } from 'viem';

import { rollupCreator, tokenBridgeCreator } from '../contracts';
import { validateParentChainId } from '../types/ParentChain';

export const getRollupCreatorAddress = (client: PublicClient) => {
  const chainId = validateParentChainId(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreator.address[chainId];
};

export const getTokenBridgeCreatorAddress = (client: PublicClient) => {
  const chainId = validateParentChainId(client);

  if (!tokenBridgeCreator.address[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return tokenBridgeCreator.address[chainId];
};
