import { Client, PublicClient, PublicClientConfig, createPublicClient } from 'viem';
import { rollupCreator } from './contracts';
import { ParentChainId, validParentChainId } from './types/ParentChain';

export interface OrbitClient extends PublicClient {
  getRollupCreatorAddress(): `0x${string}`;
  getValidChainId(): ParentChainId;
}

const validateClientChainId = (client: Client) => {
  const chainId = client.chain?.id;
  if (!validParentChainId(chainId)) {
    throw new Error('chainId is undefined');
  }
  return chainId;
};

export function createOrbitClient({ chain, transport }: PublicClientConfig): OrbitClient {
  return createPublicClient({
    chain,
    transport,
  }).extend((client: Client) => ({
    getRollupCreatorAddress: () => {
      const chainId = validateClientChainId(client);
      return rollupCreator.address[chainId];
    },
    getValidChainId: () => validateClientChainId(client),
  }));
}
