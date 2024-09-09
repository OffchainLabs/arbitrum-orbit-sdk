import { Client, Transport, Chain } from 'viem';

import { rollupCreatorAddress } from '../contracts/RollupCreator';
import { validateParentChain } from '../types/ParentChain';

export function getRollupCreatorAddress<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
) {
  const chainId = validateParentChain(client);

  // check if it's a custom parent chain
  if (client.chain?.contracts?.rollupCreator?.address) {
    return client.chain?.contracts?.rollupCreator?.address;
  }

  if (!rollupCreatorAddress[chainId]) {
    throw new Error(`Parent chain not supported: ${chainId}`);
  }

  return rollupCreatorAddress[chainId];
}
