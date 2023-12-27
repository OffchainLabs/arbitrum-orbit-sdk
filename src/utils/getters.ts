import { PublicClient } from 'viem';
import { rollupCreator } from '../contracts';
import { validParentChainId } from '../types/ParentChain';

export const getValidChainId = (client: PublicClient) => {
  const chainId = client.chain?.id;
  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }
  return chainId;
};

export const getRollupCreatorAddress = (client: PublicClient) => {
  const chainId = getValidChainId(client);
  if (!rollupCreator.address[chainId]) {
    throw new Error(`Invalid chainId or chainId not supported: ${chainId}`);
  }
  return rollupCreator.address[chainId];
};
