import { Client, Transport, Chain, ChainContract } from 'viem';

import { rollupCreatorAddress } from '../contracts/RollupCreator';
import { validateParentChain } from '../types/ParentChain';

export function getRollupCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const customParentChainRollupCreator = client.chain?.contracts?.rollupCreator as
    | ChainContract
    | undefined;

  // check if it's a custom parent chain with the factory address provided
  if (customParentChainRollupCreator?.address) {
    return customParentChainRollupCreator.address;
  }

  const chainId = validateParentChain(client);

  if (!rollupCreatorAddress[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreatorAddress[chainId];
}
