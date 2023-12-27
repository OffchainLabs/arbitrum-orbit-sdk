import { PublicClient } from 'viem';
import { rollupCreator } from '../contracts';
import { validateParentChainId } from '../types/ParentChain';

export const getRollupCreatorAddress = (client: PublicClient) => {
  const chainId = validateParentChainId(client);

  if (!rollupCreator.address[chainId]) {
    throw new Error(`Invalid chainId or chainId not supported: ${chainId}`);
  }
  return rollupCreator.address[chainId];
};
